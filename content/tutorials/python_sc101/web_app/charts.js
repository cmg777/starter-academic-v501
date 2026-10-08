// charts.js: D3 chart builders and pure helpers for the web app of the
// python_sc101 post, which applies the synthetic control method of the
// mlsynth library to Proposition 99 and cigarette sales in California.
//
// Every builder clears its container and draws an SVG at the real width of
// that container, so the labels keep their nominal size on phones and on
// wide screens. A hidden container has no width, so app.js draws a chart
// only when its tab is visible and again after a change in the window width.
// The helpers in CHARTS.util touch neither the DOM nor D3, so the Node
// invariant script can load this file and test them directly.

(function () {
  "use strict";

  // Colors of the post figures (script.py) on the dark theme of the site.
  const C = {
    bg: "#0f1729",
    panel: "#182447",
    text: "#e8ecf2",
    light: "#c8d0e0",
    muted: "#8b9dc3",
    grid: "rgba(232, 236, 242, 0.07)",
    zero: "rgba(232, 236, 242, 0.45)",
    orange: "#d97757",      // California, observed
    steel: "#6a9bcc",       // synthetic California
    teal: "#00d4c8",        // gaps
    grey: "#54618a",        // placebo states and donors without weight
    gold: "#e8b04b",        // Stata benchmark
    lightOrange: "#e8956a",
    lavender: "#a58fd8",
    sage: "#8fbf7f",
  };

  const MINUS = "−";
  const NDASH = String.fromCharCode(0x2013); // en dash, used only between numbers

  // ------------------------------------------------------------------
  // Pure helpers (no DOM, no D3)
  // ------------------------------------------------------------------

  // Fixed decimals with a true minus sign; missing values print as "n/a".
  // The method toFixed rounds the binary value, as Python does when the
  // script prints a number, so the app shows the digits of the post.
  function fmt(x, dp) {
    if (x === null || x === undefined || !Number.isFinite(+x)) return "n/a";
    const v = +x;
    const s = Math.abs(v).toFixed(dp);
    return (v < 0 && Number(s) !== 0 ? MINUS : "") + s;
  }

  // Explicit plus sign for positive differences, as in a balance table.
  function fmtSigned(x, dp) {
    const s = fmt(x, dp);
    if (s === "n/a") return s;
    return (+x > 0 && Number(Math.abs(+x).toFixed(dp)) !== 0) ? "+" + s : s;
  }

  // Numeric range such as 1985 to 1988, joined by an en dash.
  function span(a, b) {
    return a === b ? String(a) : String(a) + NDASH + String(b);
  }

  function sum(a) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i];
    return s;
  }

  function mean(a) {
    return a.length ? sum(a) / a.length : NaN;
  }

  function argMaxAbs(a) {
    let k = 0;
    for (let i = 1; i < a.length; i++) if (Math.abs(a[i]) > Math.abs(a[k])) k = i;
    return k;
  }

  // States retained by a cutoff on the pre-treatment MSPE relative to that
  // of California; a cutoff of null keeps every state, as synth2 does
  // without the cut option.
  function keptUnits(units, cutoff) {
    return units.filter(u => cutoff === null || u.pre_rel <= cutoff);
  }

  // Rank of the treated unit among the retained units by the MSPE ratio.
  // Ties count against the treated unit, as in Equation 5 of the post.
  function rankOf(kept, treated) {
    const r = kept.find(u => u.state === treated).ratio;
    return kept.filter(u => u.ratio >= r).length;
  }

  // Year-by-year placebo p-values with the tie rules of synth2. The treated
  // unit counts in the numerator and in the denominator, so the smallest
  // attainable value is one over the number of retained units.
  function pointwise(kept, treated, t0) {
    const g1 = kept.find(u => u.state === treated).gap.slice(t0);
    const n = kept.length;
    const out = { two: [], right: [], left: [] };
    g1.forEach((g, k) => {
      let two = 0;
      let right = 0;
      let left = 0;
      kept.forEach(u => {
        const v = u.gap[t0 + k];
        if (Math.abs(v) >= Math.abs(g)) two += 1;
        if (v >= g) right += 1;
        if (v <= g) left += 1;
      });
      out.two.push(two / n);
      out.right.push(right / n);
      out.left.push(left / n);
    });
    return out;
  }

  // Number of years in which a p-value sits at its floor of 1/n.
  function floorYears(p, n) {
    return p.filter(v => Math.round(v * n) === 1).length;
  }

  // Synthetic path as the weighted sum of the outcome rows (Equation 2).
  function synthPath(cigsale, w) {
    const T = cigsale[0].length;
    const out = new Array(T).fill(0);
    w.forEach((wj, j) => {
      if (wj !== 0) for (let t = 0; t < T; t++) out[t] += wj * cigsale[j][t];
    });
    return out;
  }

  // Positive weights of a fit, largest first, as [state, weight] pairs.
  function positiveWeights(states, w, eps) {
    const tol = eps === undefined ? 1e-9 : eps;
    return w.map((v, j) => [states[j], v]).filter(p => p[1] > tol)
      .sort((a, b) => b[1] - a[1]);
  }

  // Precomputed results of the lab for one cutoff stop (null means none).
  function cutoffResult(D, cutoff) {
    return D.lab_scenarios.cutoff.results.find(r => r.cutoff === cutoff) || null;
  }

  // ------------------------------------------------------------------
  // Model: every derived quantity and every formatted number of the page.
  // ------------------------------------------------------------------
  function buildModel(D) {
    const meta = D.meta;
    const b = D.baseline;
    const M = {};
    M.D = D;
    M.states = D.states;
    M.years = D.years;
    M.iCA = meta.treated_index;
    M.treated = meta.treated;
    M.t0 = meta.t0;
    M.t1 = meta.t1;
    M.treatYear = meta.treat_year;
    M.firstYear = meta.first_year;
    M.lastYear = meta.last_year;
    M.postYears = M.years.slice(M.t0);
    M.ca = D.cigsale[M.iCA];
    M.synth = b.synthetic;
    M.gap = b.gap;
    M.avgPath = b.donor_average_path;
    M.stataSynth = b.stata_w.synthetic;
    M.stataGap = b.stata_w.gap;
    M.nUnits = M.states.length;

    // Donor weights of mlsynth and of Stata, largest mlsynth weight first.
    const EPS = 1e-9;
    M.donorIdx = M.states.map((s, j) => j).filter(j => j !== M.iCA);
    M.nDonors = M.donorIdx.length;
    M.donorRows = M.donorIdx.map(j => ({
      state: M.states[j], ml: b.weights[j], stata: D.fits.stata[j],
    })).sort((a, c) => (c.ml - a.ml) || (c.stata - a.stata) || a.state.localeCompare(c.state));
    M.nPos = M.donorRows.filter(r => r.ml > EPS).length;
    M.nZero = M.nDonors - M.nPos;
    M.nZeroBoth = M.donorRows.filter(r => r.ml <= EPS && r.stata <= EPS).length;
    M.top = M.donorRows[0];
    M.maxWDiff = M.donorRows.reduce((acc, r) => {
      const d = Math.abs(r.ml - r.stata);
      return d > acc.d ? { d, state: r.state } : acc;
    }, { d: -1, state: "" });

    // Pre-treatment fit and the gap.
    const preGap = M.gap.slice(0, M.t0);
    M.caPreMean = mean(M.ca.slice(0, M.t0));
    const later = preGap.slice(1);
    const kLater = argMaxAbs(later) + 1;
    M.maxPreMiss = { value: M.gap[kLater], year: M.years[kLater] };

    // Predictor balance and predictor weights.
    const bal = b.balance;
    M.balance = bal.names.map((name, k) => {
      const tr = bal.treated[k];
      return {
        name, label: bal.labels[k], treated: tr,
        synthetic: bal.synthetic[k], average: bal.donor_average[k],
        stata: bal.stata_synthetic[k],
        pctSyn: 100 * (bal.synthetic[k] / tr - 1),
        pctAvg: 100 * (bal.donor_average[k] / tr - 1),
        vMl: b.v_weights.mlsynth[k], vStata: b.v_weights.stata[k],
      };
    });
    M.mapgSyn = mean(M.balance.map(r => Math.abs(r.pctSyn)));
    M.mapgAvg = mean(M.balance.map(r => Math.abs(r.pctAvg)));
    const vIdx = name => b.v_weights.names.indexOf(name);

    // In-space placebo test.
    M.units = D.placebo.units;
    M.stataTable = {};
    D.stata.placebo.table.forEach(r => { M.stataTable[r.unit] = r; });
    M.cutStops = [null, 5, 2, 1];
    M.cut = {};
    M.cutStops.forEach(c => {
      const kept = keptUnits(M.units, c);
      const res = cutoffResult(D, c);
      M.cut[String(c)] = { cutoff: c, kept, rank: rankOf(kept, M.treated), res };
    });
    M.allRankOne = M.cutStops.every(c => M.cut[String(c)].rank === 1);

    // In-time placebo and leave-one-out.
    M.intime = D.intime;
    M.fit85 = D.intime.fits.find(f => f.fake_year === D.intime.default) || D.intime.fits[0];
    M.loo = D.loo;
    M.looBand = { lo: [], hi: [] };
    M.years.forEach((y, t) => {
      const g = D.loo.fits.map(f => f.gap[t]);
      M.looBand.lo.push(Math.min.apply(null, g));
      M.looBand.hi.push(Math.max.apply(null, g));
    });
    M.looBandMaxPost = Math.max.apply(null, M.looBand.hi.slice(M.t0));

    // Estimator tour.
    M.tour = D.tour;
    const sc = M.tour.filter(t => t.counterfactual);
    const byAtt = sc.slice().sort((a, c) => a.att - c.att);
    M.tourMin = byAtt[0];
    M.tourMax = byAtt[byAtt.length - 1];
    // Short names for running text; the full names stay in charts and tables.
    const SHORT = {
      vanillasc_adh: "the baseline",
      vanillasc_outcome: "outcome-only VanillaSC",
      sdid: "SDID",
      clustersc_pcr: "CLUSTERSC",
    };
    const tk = key => M.tour.find(t => t.key === key);
    M.tourAdh = tk("vanillasc_adh");
    M.tourOut = tk("vanillasc_outcome");
    M.tourSdid = tk("sdid");
    M.tourPcr = tk("clustersc_pcr");
    M.tourTwfe = tk("twfe_did");
    const mOut = /rank (\d+), p ([0-9.]+)/.exec(M.tourOut.inference || "");
    M.outRank = mOut ? +mOut[1] : null;
    M.outP = mOut ? +mOut[2] : null;
    const mPcr = /(\d+) in the cluster, (\d+) negative/.exec(M.tourPcr.donors || "");
    M.pcrN = mPcr ? +mPcr[1] : null;
    M.pcrNeg = mPcr ? +mPcr[2] : null;
    M.pcrLowestRmse = sc.every(t => t.pre_rmse >= M.tourPcr.pre_rmse);
    M.sdidLeastNegative = M.tourMax.key === "sdid";

    // Formatted values for the data-v placeholders of index.html.
    const fake = M.fit85;
    const none = M.cut["null"].res;
    const cut1 = M.cut["1"].res;
    M.V = {
      att: fmt(b.att, 2),
      att_stata: fmt(D.stata.baseline.att, 2),
      att_stata_w: fmt(b.stata_w.att, 2),
      att_pct: fmt(Math.abs(b.att_percent), 1),
      rmse: fmt(b.pre_rmse, 3),
      rmse_stata: fmt(D.stata.baseline.rmse, 3),
      r2: fmt(b.r2, 3),
      r2_stata: fmt(b.r2_stata_definition, 3),
      rmse_pct: fmt(100 * b.pre_rmse / M.caPreMean, 1),
      gap_1970: fmt(M.gap[0], 2),
      max_pre_miss: fmt(M.maxPreMiss.value, 2),
      max_pre_miss_year: String(M.maxPreMiss.year),
      gap_first_post: fmt(M.gap[M.t0], 2),
      gap_2000: fmt(b.gap_2000, 2),
      gap_2000_pct: fmt(Math.abs(b.gap_2000_percent), 1),
      n_units: String(M.nUnits),
      n_donors: String(M.nDonors),
      n_pos: String(M.nPos),
      n_zero: String(M.nZero),
      top_donor: M.top.state,
      top_weight: fmt(M.top.ml, 3),
      rank_ca: String(D.placebo.rank_ca),
      p_all: fmt(D.placebo.p_all, 3),
      ratio_ca: fmt(D.placebo.ratio_ca, 1),
      mapg_syn: fmt(M.mapgSyn, 2),
      mapg_avg: fmt(M.mapgAvg, 2),
      max_w_diff: fmt(M.maxWDiff.d, 4),
      max_w_diff_state: M.maxWDiff.state,
      v_ml_age: fmt(b.v_weights.mlsynth[vIdx("age15to24")], 3),
      v_ml_price: fmt(b.v_weights.mlsynth[vIdx("retprice")], 3),
      v_ml_1975: fmt(b.v_weights.mlsynth[vIdx("cigsale_1975")], 3),
      v_st_age: fmt(b.v_weights.stata[vIdx("age15to24")], 3),
      v_st_1975: fmt(b.v_weights.stata[vIdx("cigsale_1975")], 3),
      fake_year: String(fake.fake_year),
      fake_mean: fmt(fake.fake_gap_mean, 2),
      fake_post_mean: fmt(fake.post_gap_mean, 2),
      fake_share: fmt(fake.fake_gap_mean / b.att, 2),
      n_loo: String(D.loo.fits.length),
      loo_att_lo: fmt(D.loo.att_range[0], 2),
      loo_att_hi: fmt(D.loo.att_range[1], 2),
      loo_g2000_lo: fmt(D.loo.gap_2000_range[0], 2),
      loo_g2000_hi: fmt(D.loo.gap_2000_range[1], 2),
      loo_band_max: fmt(M.looBandMaxPost, 2),
      p_none: fmt(none ? none.p : NaN, 3),
      p_cut1: fmt(cut1 ? cut1.p : NaN, 3),
      tour_min: fmt(M.tourMin.att, 2),
      tour_min_name: SHORT[M.tourMin.key] || M.tourMin.estimator,
      tour_max: fmt(M.tourMax.att, 2),
      tour_max_name: SHORT[M.tourMax.key] || M.tourMax.estimator,
      sdid_att: fmt(M.tourSdid.att, 2),
      pcr_n: String(M.pcrN),
      pcr_neg: String(M.pcrNeg),
      pcr_rmse: fmt(M.tourPcr.pre_rmse, 3),
      out_rmse: fmt(M.tourOut.pre_rmse, 3),
      base_rmse: fmt(M.tourAdh.pre_rmse, 3),
      out_rank: String(M.outRank),
      out_p: fmt(M.outP, 3),
      twfe_att: fmt(M.tourTwfe.att, 2),
      stata_fake_year: String(D.stata.intime.fake_year),
    };
    return M;
  }

  // ------------------------------------------------------------------
  // DOM helpers: layout, axes, tooltip, and legend
  // ------------------------------------------------------------------

  // Width of a container without its horizontal padding.
  function innerWidth(container) {
    const cs = window.getComputedStyle(container);
    const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    return Math.max(0, container.clientWidth - pad);
  }

  // Clear the container and append an SVG drawn at its real width.
  function frame(container, spec) {
    container.textContent = "";
    const inner = innerWidth(container);
    const compact = inner > 0 && inner < 560;
    const W = inner > 0 ? Math.max(260, Math.floor(inner)) : 760;
    const H = typeof spec.height === "function" ? spec.height(compact) : (compact ? spec.hCompact : spec.h);
    const m = Object.assign({}, compact ? spec.mCompact : spec.m);
    const svg = d3.select(container).append("svg")
      .attr("class", "chart")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("width", W)
      .attr("height", H)
      .attr("role", "img")
      .attr("aria-label", spec.aria || "Chart");
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);
    return { svg, g, W, H, m, w: W - m.left - m.right, h: H - m.top - m.bottom, compact };
  }

  function styleAxis(sel) {
    sel.selectAll("text").attr("fill", C.muted).attr("font-size", 11);
    sel.selectAll(".domain, .tick line").attr("stroke", C.muted).attr("stroke-opacity", 0.55);
  }

  function getTooltip(container) {
    let tip = d3.select(container).select(".tooltip");
    if (tip.empty()) tip = d3.select(container).append("div").attr("class", "tooltip");
    return tip;
  }

  // Place the tooltip next to the pointer, inside the container, so it never
  // widens the page on a narrow screen.
  function showTooltip(tip, container, ev, html) {
    const rect = container.getBoundingClientRect();
    tip.html(html).classed("show", true);
    const node = tip.node();
    const tw = node.offsetWidth || 180;
    const th = node.offsetHeight || 60;
    let left = ev.clientX - rect.left + 14;
    if (left + tw > rect.width - 4) left = Math.max(4, ev.clientX - rect.left - tw - 14);
    let top = ev.clientY - rect.top + 14;
    if (top + th > rect.height - 4) top = Math.max(4, ev.clientY - rect.top - th - 14);
    tip.style("left", left + "px").style("top", top + "px");
  }

  function hideTooltip(tip) {
    tip.classed("show", false);
  }

  // Escape text before it enters the markup of a tooltip.
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Tooltip body: a title line and rows of key and value pairs.
  function tipHtml(title, rows) {
    let html = `<div class="tt-title">${esc(title)}</div>`;
    rows.forEach(r => {
      if (!r) return;
      html += `<div><span class="tooltip-key">${esc(r[0])}</span> <span class="tooltip-val">${esc(r[1])}</span></div>`;
    });
    return html;
  }

  // HTML legend under a chart; it wraps on narrow screens.
  function legend(container, items) {
    if (!items || !items.length) return;
    const div = d3.select(container).append("div").attr("class", "legend");
    items.forEach(it => {
      const s = div.append("span").attr("class", "item");
      const sw = s.append("svg").attr("viewBox", "0 0 26 12").attr("aria-hidden", "true");
      const kind = it.kind || "line";
      if (kind === "band") {
        sw.append("rect").attr("x", 1).attr("y", 1).attr("width", 24).attr("height", 10)
          .attr("fill", it.color).attr("fill-opacity", it.opacity || 0.3);
      } else if (kind === "rect") {
        sw.append("rect").attr("x", 1).attr("y", 2).attr("width", 24).attr("height", 8)
          .attr("rx", 1.5).attr("fill", it.color).attr("fill-opacity", it.opacity || 0.9);
      } else if (kind === "dot" || kind === "hollow") {
        sw.append("circle").attr("cx", 13).attr("cy", 6).attr("r", 4.2)
          .attr("fill", kind === "dot" ? it.color : "none")
          .attr("stroke", it.color).attr("stroke-width", 1.6);
      } else if (kind === "tick") {
        sw.append("line").attr("x1", 13).attr("x2", 13).attr("y1", 0).attr("y2", 12)
          .attr("stroke", it.color).attr("stroke-width", 3);
      } else {
        sw.append("line").attr("x1", 1).attr("x2", 25).attr("y1", 6).attr("y2", 6)
          .attr("stroke", it.color).attr("stroke-width", it.width || 2.6)
          .attr("stroke-dasharray", it.dash || null);
      }
      s.append("span").text(it.label);
    });
  }

  // ------------------------------------------------------------------
  // Line chart: paths, gaps, placebo gaps, bands, and p-values by year.
  //   spec.x: shared x values (years); spec.series: [{ y, x?, color,
  //   width, dash, opacity, cls, line, points, hollow, r, key }];
  //   spec.band: { lo, hi, color, opacity, cls }; spec.shades, spec.vlines,
  //   spec.hlines: reference marks; spec.tip(i, yValue): tooltip HTML;
  //   spec.onHover(i, yValue) and spec.onLeave(): optional highlights.
  // ------------------------------------------------------------------
  function lineChart(container, spec) {
    const F = frame(container, {
      aria: spec.aria,
      h: spec.h || 380,
      hCompact: spec.hCompact || 300,
      m: Object.assign({ top: 18, right: 22, bottom: 42, left: 58 }, spec.m || {}),
      mCompact: Object.assign({ top: 14, right: 12, bottom: 40, left: 48 }, spec.mCompact || {}),
    });
    const { g, w, h, compact } = F;
    const xs = spec.x;
    const xDomain = spec.xDomain || [d3.min(xs), d3.max(xs)];
    const x = d3.scaleLinear().domain(xDomain).range([0, w]);

    let yDomain = spec.yDomain;
    if (!yDomain) {
      const vals = [];
      spec.series.forEach(s => s.y.forEach(v => { if (v !== null && Number.isFinite(v)) vals.push(v); }));
      if (spec.band) {
        spec.band.lo.forEach(v => vals.push(v));
        spec.band.hi.forEach(v => vals.push(v));
      }
      (spec.hlines || []).forEach(l => vals.push(l.y));
      let lo = d3.min(vals);
      let hi = d3.max(vals);
      if (spec.includeZero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
      const pad = (hi - lo) * 0.06 || 1;
      yDomain = [lo - pad, hi + pad];
    }
    const y = d3.scaleLinear().domain(yDomain).range([h, 0]);
    if (!spec.yDomain) y.nice();

    // Grid and axes.
    const nyt = compact ? 5 : 6;
    g.append("g").attr("class", "grid")
      .call(d3.axisLeft(y).ticks(nyt).tickSize(-w).tickFormat(""))
      .call(s => s.select(".domain").remove())
      .selectAll("line").attr("stroke", C.grid);
    const xAxis = d3.axisBottom(x).tickFormat(d3.format("d")).tickSizeOuter(0);
    if (spec.xTicks) xAxis.tickValues(compact && spec.xTicksCompact ? spec.xTicksCompact : spec.xTicks);
    else xAxis.ticks(compact ? 5 : 8);
    g.append("g").attr("transform", `translate(0,${h})`).call(xAxis).call(styleAxis);
    const yAxis = d3.axisLeft(y).ticks(nyt).tickSizeOuter(0);
    if (spec.yFormat) yAxis.tickFormat(spec.yFormat);
    g.append("g").call(yAxis).call(styleAxis);
    g.append("text")
      .attr("x", w / 2).attr("y", h + 34).attr("text-anchor", "middle")
      .attr("fill", C.light).attr("font-size", 12)
      .text(spec.xLabel || "Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h / 2},${compact ? -36 : -44})`)
      .attr("text-anchor", "middle").attr("fill", C.light).attr("font-size", 12)
      .text(compact && spec.yLabelCompact ? spec.yLabelCompact : (spec.yLabel || ""));

    const layer = g.append("g").attr("class", "marks");

    (spec.shades || []).forEach(sh => {
      const x0 = Math.max(0, x(sh.from));
      const x1 = Math.min(w, x(sh.to));
      layer.append("rect").attr("class", sh.cls || "shade")
        .attr("x", x0).attr("y", 0).attr("width", Math.max(0, x1 - x0)).attr("height", h)
        .attr("fill", sh.color || C.light).attr("fill-opacity", sh.opacity || 0.06);
    });

    (spec.hlines || []).forEach(l => {
      layer.append("line").attr("class", l.cls || "hline")
        .attr("x1", 0).attr("x2", w).attr("y1", y(l.y)).attr("y2", y(l.y))
        .attr("stroke", l.color || C.zero).attr("stroke-width", l.width || 1)
        .attr("stroke-dasharray", l.dash || null);
      if (l.label) {
        layer.append("text").attr("class", "halo").attr("x", w - 4).attr("y", y(l.y) - 4)
          .attr("text-anchor", "end").attr("fill", l.color || C.muted).attr("font-size", 10.5)
          .text(l.label);
      }
    });

    (spec.vlines || []).forEach((l, k) => {
      const xv = x(l.x);
      layer.append("line").attr("class", l.cls || "vline")
        .attr("x1", xv).attr("x2", xv).attr("y1", 0).attr("y2", h)
        .attr("stroke", l.color || C.light).attr("stroke-width", l.width || 1.4)
        .attr("stroke-dasharray", l.dash || "2 4");
      if (l.label) {
        // Flip the label to the other side of the line when it would run
        // past the plot area; about 0.56 em per character at this size.
        const est = l.label.length * 10.5 * 0.56;
        let left = l.anchor === "end";
        if (!left && xv + 5 + est > w) left = true;
        if (left && xv - 5 - est < 0) left = false;
        layer.append("text").attr("class", "halo")
          .attr("x", left ? xv - 5 : xv + 5).attr("y", 12 + k * 14)
          .attr("text-anchor", left ? "end" : "start")
          .attr("fill", l.color || C.light).attr("font-size", 10.5)
          .text(l.label);
      }
    });

    if (spec.band) {
      const bx = spec.band.x || xs;
      const area = d3.area().x((d, i) => x(bx[i])).y0((d, i) => y(spec.band.lo[i])).y1((d, i) => y(spec.band.hi[i]));
      layer.append("path").attr("class", spec.band.cls || "band")
        .attr("d", area(spec.band.lo))
        .attr("fill", spec.band.color || C.teal).attr("fill-opacity", spec.band.opacity || 0.18)
        .attr("stroke", "none");
    }

    spec.series.forEach(s => {
      const sx = s.x || xs;
      const pts = s.y.map((v, i) => [sx[i], v]).filter(p => p[1] !== null && Number.isFinite(p[1]));
      if (s.line !== false) {
        const line = d3.line().x(p => x(p[0])).y(p => y(p[1]));
        const path = layer.append("path").attr("class", s.cls || "series")
          .attr("d", line(pts))
          .attr("fill", "none").attr("stroke", s.color).attr("stroke-width", s.width || 2)
          .attr("stroke-opacity", s.opacity === undefined ? 1 : s.opacity)
          .attr("stroke-dasharray", s.dash || null)
          .attr("stroke-linejoin", "round").attr("stroke-linecap", "round");
        if (s.key) path.attr("data-key", s.key);
      }
      if (s.points) {
        layer.selectAll(null).data(pts).enter().append("circle")
          .attr("class", s.pointCls || ((s.cls || "series") + "-pt"))
          .attr("cx", p => x(p[0])).attr("cy", p => y(p[1]))
          .attr("r", s.r || (compact ? 3 : 3.6))
          .attr("fill", s.hollow ? "none" : s.color)
          .attr("stroke", s.hollow ? s.color : C.bg)
          .attr("stroke-width", s.hollow ? 1.8 : 0.8);
      }
    });

    // Hover: a guide line follows the nearest x value, and the tooltip
    // reports the values of that year.
    if (spec.tip) {
      const tip = getTooltip(container);
      const guide = g.append("line").attr("class", "guide")
        .attr("y1", 0).attr("y2", h).attr("stroke", C.light)
        .attr("stroke-opacity", 0).attr("stroke-dasharray", "2 3").attr("pointer-events", "none");
      const hx = spec.hoverX || xs;
      const overlay = g.append("rect").attr("class", "overlay")
        .attr("width", w).attr("height", h).attr("fill", "transparent")
        .style("cursor", "crosshair");
      const at = ev => {
        const pt = d3.pointer(ev, g.node());
        let i = 0;
        let best = Infinity;
        hx.forEach((xv, k) => {
          const d = Math.abs(x(xv) - pt[0]);
          if (d < best) { best = d; i = k; }
        });
        guide.attr("x1", x(hx[i])).attr("x2", x(hx[i])).attr("stroke-opacity", 0.55);
        const yv = y.invert(pt[1]);
        if (spec.onHover) spec.onHover(i, yv);
        const html = spec.tip(i, yv);
        if (html) showTooltip(tip, container, ev, html);
      };
      overlay.on("pointermove", at).on("pointerdown", at).on("pointerleave", () => {
        guide.attr("stroke-opacity", 0);
        hideTooltip(tip);
        if (spec.onLeave) spec.onLeave();
      });
    }

    legend(container, spec.legend);
    return { x, y, compact };
  }

  // ------------------------------------------------------------------
  // Donor weights: one bar per donor for mlsynth and a gold tick for Stata.
  //   rows: [{ state, ml, stata }], sorted as they should appear.
  // ------------------------------------------------------------------
  function donorBars(container, rows, opts) {
    const o = opts || {};
    const wide = rows.length <= 8;
    const rowH = wide ? 30 : 17;
    const F = frame(container, {
      aria: o.aria,
      height: compact => (compact ? 12 : 16) + rows.length * rowH + 42,
      m: { top: 16, right: 90, bottom: 42, left: 132 },
      mCompact: { top: 12, right: 64, bottom: 42, left: 96 },
    });
    const { g, w, h, compact } = F;
    // Extra room on the right keeps the value labels inside the chart.
    const room = wide ? (compact ? 1.5 : 1.25) : 1.12;
    const xMax = d3.max(rows, r => Math.max(r.ml, r.stata)) * room || 0.1;
    const x = d3.scaleLinear().domain([0, xMax]).range([0, w]);
    const yb = d3.scaleBand().domain(rows.map(r => r.state)).range([0, h]).padding(wide ? 0.32 : 0.22);

    g.append("g").attr("class", "grid")
      .call(d3.axisBottom(x).ticks(compact ? 3 : 5).tickSize(h).tickFormat(""))
      .call(s => s.select(".domain").remove())
      .selectAll("line").attr("stroke", C.grid);
    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(compact ? 3 : 5).tickFormat(d3.format(".2f")).tickSizeOuter(0))
      .call(styleAxis);
    g.append("text").attr("x", w / 2).attr("y", h + 34).attr("text-anchor", "middle")
      .attr("fill", C.light).attr("font-size", 12)
      .text("Weight in synthetic California");

    const tip = getTooltip(container);
    rows.forEach(r => {
      const yc = yb(r.state);
      const bh = yb.bandwidth();
      const pos = r.ml > 1e-9;
      const row = g.append("g").attr("class", "donor-row");
      row.append("text").attr("x", -8).attr("y", yc + bh / 2 + 4)
        .attr("text-anchor", "end").attr("font-size", wide ? 12 : 11)
        .attr("fill", pos ? C.text : C.muted)
        .text(r.state);
      row.append("rect").attr("class", "donor-bar")
        .attr("x", 0).attr("y", yc).attr("height", bh)
        .attr("width", pos ? Math.max(1, x(r.ml)) : 2)
        .attr("rx", 1.5)
        .attr("fill", pos ? C.steel : C.grey).attr("fill-opacity", pos ? 0.92 : 0.7);
      if (r.stata > 1e-9) {
        const xt = x(r.stata);
        row.append("line").attr("class", "stata-tick")
          .attr("x1", xt).attr("x2", xt).attr("y1", yc - 3).attr("y2", yc + bh + 3)
          .attr("stroke", C.gold).attr("stroke-width", 3).attr("stroke-linecap", "round");
      }
      if (pos) {
        // The mlsynth weight in light text, then the Stata weight in gold.
        const xe = Math.max(x(r.ml), r.stata > 1e-9 ? x(r.stata) : 0) + 8;
        const t = row.append("text").attr("class", "donor-val")
          .attr("x", xe).attr("y", yc + bh / 2 + 4)
          .attr("font-size", 11);
        t.append("tspan").attr("fill", C.light).text(fmt(r.ml, 3));
        if (r.stata > 1e-9) t.append("tspan").attr("fill", C.gold).attr("dx", 6).text(fmt(r.stata, 3));
      }
      row.append("rect").attr("class", "hit")
        .attr("x", -F.m.left).attr("y", yc - (yb.step() - bh) / 2)
        .attr("width", F.m.left + w + F.m.right).attr("height", yb.step())
        .attr("fill", "transparent")
        .on("pointermove pointerdown", ev => showTooltip(tip, container, ev, tipHtml(r.state, [
          ["mlsynth weight", fmt(r.ml, 4)],
          ["Stata weight", fmt(r.stata, 4)],
          ["Difference", fmt(r.ml - r.stata, 4)],
        ])))
        .on("pointerleave", () => hideTooltip(tip));
    });

    legend(container, [
      { label: "mlsynth weight (VanillaSC)", kind: "rect", color: C.steel },
      { label: "Stata weight (synth2)", kind: "tick", color: C.gold },
      { label: "Zero weight", kind: "rect", color: C.grey, opacity: 0.7 },
    ]);
  }

  // ------------------------------------------------------------------
  // Paired bars: one row per item, mlsynth in steel and Stata in gold.
  //   rows: [{ label, a, b }]
  // ------------------------------------------------------------------
  function pairedBars(container, rows, opts) {
    const o = opts || {};
    const F = frame(container, {
      aria: o.aria,
      height: () => 16 + rows.length * 34 + 42,
      m: { top: 12, right: 52, bottom: 42, left: 132 },
      mCompact: { top: 10, right: 46, bottom: 42, left: 116 },
    });
    const { g, w, h, compact } = F;
    const x = d3.scaleLinear().domain([0, Math.max(0.1, d3.max(rows, r => Math.max(r.a, r.b)) * 1.12)]).range([0, w]);
    const yb = d3.scaleBand().domain(rows.map(r => r.label)).range([0, h]).padding(0.2);
    const half = yb.bandwidth() / 2;

    g.append("g").attr("class", "grid")
      .call(d3.axisBottom(x).ticks(compact ? 3 : 5).tickSize(h).tickFormat(""))
      .call(s => s.select(".domain").remove())
      .selectAll("line").attr("stroke", C.grid);
    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(compact ? 3 : 5).tickFormat(d3.format(".1f")).tickSizeOuter(0))
      .call(styleAxis);
    g.append("text").attr("x", w / 2).attr("y", h + 34).attr("text-anchor", "middle")
      .attr("fill", C.light).attr("font-size", 12)
      .text(o.xLabel || "Weight");

    const tip = getTooltip(container);
    rows.forEach(r => {
      const yc = yb(r.label);
      g.append("text").attr("x", -8).attr("y", yc + half + 4)
        .attr("text-anchor", "end").attr("font-size", 11.5).attr("fill", C.text)
        .text(r.label);
      [[r.a, C.steel, 0, "v-bar-ml"], [r.b, C.gold, half, "v-bar-stata"]].forEach(p => {
        g.append("rect").attr("class", p[3])
          .attr("x", 0).attr("y", yc + p[2] + 1).attr("height", half - 2)
          .attr("width", Math.max(1, x(p[0]))).attr("rx", 1.5)
          .attr("fill", p[1]).attr("fill-opacity", 0.9);
        g.append("text").attr("x", x(p[0]) + 5).attr("y", yc + p[2] + half / 2 + 4)
          .attr("font-size", 10.5).attr("fill", C.light)
          .text(fmt(p[0], 3));
      });
      g.append("rect").attr("x", -F.m.left).attr("y", yc).attr("width", F.m.left + w + F.m.right)
        .attr("height", yb.bandwidth()).attr("fill", "transparent")
        .on("pointermove pointerdown", ev => showTooltip(tip, container, ev, tipHtml(r.label, [
          [o.aName || "mlsynth", fmt(r.a, 4)], [o.bName || "Stata", fmt(r.b, 4)],
        ])))
        .on("pointerleave", () => hideTooltip(tip));
    });

    legend(container, [
      { label: o.aName || "mlsynth", kind: "rect", color: C.steel },
      { label: o.bName || "Stata", kind: "rect", color: C.gold },
    ]);
  }

  // ------------------------------------------------------------------
  // Ranking bars: MSPE ratios of all states, largest first. California is
  // orange, retained placebo states are steel blue, and states removed by
  // the cutoff are grey.
  //   rows: [{ state, ratio, kept, isTreated, pre_mspe, post_mspe,
  //            pre_rel, stataRatio }]
  // ------------------------------------------------------------------
  function rankingBars(container, rows, opts) {
    const o = opts || {};
    const sorted = rows.slice().sort((a, b) => b.ratio - a.ratio);
    const rowH = 18;
    const F = frame(container, {
      aria: o.aria,
      height: () => 14 + sorted.length * rowH + 42,
      m: { top: 10, right: 52, bottom: 42, left: 116 },
      mCompact: { top: 10, right: 44, bottom: 42, left: 104 },
    });
    const { g, w, h, compact } = F;
    const x = d3.scaleLinear().domain([0, d3.max(sorted, r => r.ratio) * 1.04]).range([0, w]);
    const yb = d3.scaleBand().domain(sorted.map(r => r.state)).range([0, h]).padding(0.2);

    g.append("g").attr("class", "grid")
      .call(d3.axisBottom(x).ticks(compact ? 4 : 6).tickSize(h).tickFormat(""))
      .call(s => s.select(".domain").remove())
      .selectAll("line").attr("stroke", C.grid);
    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(compact ? 4 : 6).tickSizeOuter(0))
      .call(styleAxis);
    g.append("text").attr("x", w / 2).attr("y", h + 34).attr("text-anchor", "middle")
      .attr("fill", C.light).attr("font-size", 12)
      .text(compact ? "Post MSPE divided by pre MSPE" : "Post-treatment MSPE divided by pre-treatment MSPE");

    const tip = getTooltip(container);
    sorted.forEach((r, k) => {
      const yc = yb(r.state);
      const bh = yb.bandwidth();
      const color = r.isTreated ? C.orange : (r.kept ? C.steel : C.grey);
      const cls = r.isTreated ? "rank-bar rank-ca" : (r.kept ? "rank-bar rank-kept" : "rank-bar rank-removed");
      g.append("text").attr("x", -8).attr("y", yc + bh / 2 + 4)
        .attr("text-anchor", "end").attr("font-size", 11)
        .attr("font-weight", r.isTreated ? 700 : 400)
        .attr("fill", r.isTreated ? C.orange : (r.kept ? C.text : C.muted))
        .text(r.state);
      g.append("rect").attr("class", cls)
        .attr("x", 0).attr("y", yc).attr("height", bh)
        .attr("width", Math.max(1, x(r.ratio))).attr("rx", 1.5)
        .attr("fill", color).attr("fill-opacity", r.kept || r.isTreated ? 0.92 : 0.75);
      g.append("text").attr("x", x(r.ratio) + 5).attr("y", yc + bh / 2 + 4)
        .attr("font-size", 10.5).attr("fill", r.kept || r.isTreated ? C.light : C.muted)
        .text(fmt(r.ratio, r.ratio < 1 ? 2 : 1));
      g.append("rect").attr("x", -F.m.left).attr("y", yc - (yb.step() - bh) / 2)
        .attr("width", F.m.left + w + F.m.right).attr("height", yb.step())
        .attr("fill", "transparent")
        .on("pointermove pointerdown", ev => showTooltip(tip, container, ev, tipHtml(r.state, [
          ["Rank", `${k + 1} of ${sorted.length}`],
          ["MSPE ratio", fmt(r.ratio, 2)],
          ["Pre-treatment MSPE", fmt(r.pre_mspe, 2)],
          ["Post-treatment MSPE", fmt(r.post_mspe, 2)],
          ["Pre MSPE relative to California", fmt(r.pre_rel, 3)],
          ["Under this filter", r.isTreated ? "treated unit" : (r.kept ? "retained" : "removed")],
          r.stataRatio !== undefined ? ["Stata ratio", fmt(r.stataRatio, 1)] : null,
        ])))
        .on("pointerleave", () => hideTooltip(tip));
    });

    legend(container, [
      { label: "California", kind: "rect", color: C.orange },
      { label: "Placebo state, retained", kind: "rect", color: C.steel },
      { label: "Placebo state, removed by the cutoff", kind: "rect", color: C.grey, opacity: 0.75 },
    ]);
  }

  // ------------------------------------------------------------------
  // Dot plot of estimates with reference lines.
  //   rows: [{ label, value, color, hollow, cls }];
  //   refs: [{ value, label, color, dash, cls }]
  // ------------------------------------------------------------------
  function dotPlot(container, rows, opts) {
    const o = opts || {};
    const F = frame(container, {
      aria: o.aria,
      height: compact => (compact ? 54 : 40) * rows.length + 70,
      m: { top: 26, right: 30, bottom: 44, left: 190 },
      mCompact: { top: 26, right: 18, bottom: 44, left: 12 },
    });
    const { g, w, h, compact } = F;
    const vals = rows.map(r => r.value).concat((o.refs || []).map(r => r.value));
    const lo = Math.min(0, d3.min(vals));
    const hi = Math.max(0, d3.max(vals));
    const pad = (hi - lo) * 0.08;
    const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([0, w]).nice();
    const yb = d3.scaleBand().domain(rows.map(r => r.label)).range([0, h]).padding(0.3);

    g.append("g").attr("class", "grid")
      .call(d3.axisBottom(x).ticks(compact ? 4 : 7).tickSize(h).tickFormat(""))
      .call(s => s.select(".domain").remove())
      .selectAll("line").attr("stroke", C.grid);
    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(compact ? 4 : 7).tickSizeOuter(0))
      .call(styleAxis);
    g.append("text").attr("x", w / 2).attr("y", h + 36).attr("text-anchor", "middle")
      .attr("fill", C.light).attr("font-size", 12)
      .text(o.xLabel || "Estimate");

    (o.refs || []).forEach((r, k) => {
      g.append("line").attr("class", r.cls || "ref-line")
        .attr("x1", x(r.value)).attr("x2", x(r.value)).attr("y1", -8).attr("y2", h)
        .attr("stroke", r.color).attr("stroke-width", r.width || 1.6)
        .attr("stroke-dasharray", r.dash || null);
      if (r.label) {
        g.append("text").attr("class", "halo").attr("x", x(r.value) + (r.anchor === "end" ? -5 : 5)).attr("y", -12)
          .attr("text-anchor", r.anchor === "end" ? "end" : "start")
          .attr("font-size", 10.5).attr("fill", r.color)
          .text(r.label);
      }
    });

    const tip = getTooltip(container);
    rows.forEach(r => {
      const yc = yb(r.label) + yb.bandwidth() / 2;
      if (compact) {
        g.append("text").attr("class", "halo").attr("x", 0).attr("y", yc - 11)
          .attr("font-size", 11.5).attr("fill", C.text).text(r.label);
      } else {
        g.append("text").attr("x", -12).attr("y", yc + 4).attr("text-anchor", "end")
          .attr("font-size", 12).attr("fill", C.text).text(r.label);
      }
      const cy = compact ? yc + 6 : yc;
      g.append("line").attr("x1", x(0)).attr("x2", x(r.value)).attr("y1", cy).attr("y2", cy)
        .attr("stroke", r.color).attr("stroke-opacity", 0.35).attr("stroke-width", 2);
      g.append("circle").attr("class", r.cls || "dot")
        .attr("cx", x(r.value)).attr("cy", cy).attr("r", 7)
        .attr("fill", r.hollow ? C.bg : r.color)
        .attr("stroke", r.color).attr("stroke-width", r.hollow ? 2.2 : 1);
      // The value label sits on the side away from the reference line that
      // the options name in avoid, unless that side lacks room.
      const xv = x(r.value);
      const room = 50;
      let right = o.avoid === undefined ? xv < w * 0.35 : xv >= x(o.avoid);
      if (right && xv + 12 + room > w) right = false;
      if (!right && xv - 12 - room < 0) right = true;
      g.append("text").attr("class", "halo")
        .attr("x", xv + (right ? 12 : -12)).attr("y", cy + 4)
        .attr("text-anchor", right ? "start" : "end")
        .attr("font-size", 11.5).attr("font-weight", 600).attr("fill", C.light)
        .text(fmt(r.value, 2));
      g.append("rect").attr("x", -F.m.left).attr("y", yb(r.label))
        .attr("width", F.m.left + w + F.m.right).attr("height", yb.bandwidth())
        .attr("fill", "transparent")
        .on("pointermove pointerdown", ev => showTooltip(tip, container, ev, tipHtml(r.label, r.tip || [["Estimate", fmt(r.value, 2)]])))
        .on("pointerleave", () => hideTooltip(tip));
    });

    legend(container, o.legend);
  }

  window.CHARTS = {
    C,
    lineChart,
    donorBars,
    pairedBars,
    rankingBars,
    dotPlot,
    tipHtml,
    util: {
      fmt,
      fmtSigned,
      span,
      sum,
      mean,
      keptUnits,
      rankOf,
      pointwise,
      floorYears,
      synthPath,
      positiveWeights,
      cutoffResult,
      buildModel,
    },
  };
})();
