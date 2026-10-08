/* charts.js — D3 v7 chart factories for the Bayesian spatial synthetic control lab.
 *
 * Every factory takes (selector, data, opts) and re-renders from scratch. The
 * data volumes here are tiny (38 donors, 31 years, ~5k thinned draws), so
 * teardown-and-redraw is simpler and fast enough; nothing needs an update join.
 */
(function (window) {
  "use strict";

  var C = {
    bg: "#0f1729",
    panel: "#1f2b5e",
    text: "#c8d0e0",
    bright: "#e8ecf2",
    muted: "#8b9dc3",
    donor: "#54618a",
    steel: "#6a9bcc",
    orange: "#d97757",
    teal: "#00d4c8",
    gold: "#e8b04b",
    violet: "#c47ad0"
  };

  var STAGE_COLOR = {
    classical: C.steel,
    bscm: C.gold,
    scspill_rho0: C.violet,
    scspill_sar: C.teal
  };

  var STAGE_LABEL = {
    classical: "Classical SC (simplex)",
    bscm: "Bayesian SC (BSCM)",
    scspill_rho0: "Bayesian SC (ρ = 0)",
    scspill_sar: "Bayesian spatial SC"
  };

  function clear(sel) {
    d3.select(sel).selectAll("*").remove();
  }

  /* Tooltips use d3's .html() so they can carry <br> and <strong>. Every value
   * interpolated into them comes from results.json -- author-generated, but
   * escaped anyway so a stray angle bracket in an estimator's error message
   * cannot become markup. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // The nearest preceding heading inside the same .chart-card is the chart's
  // visible name; reuse it rather than duplicating a label at every call site.
  function nearestHeading(node) {
    var card = node && node.closest ? node.closest(".chart-card, .tab-pane") : null;
    var h = card ? card.querySelector("h3, h2") : null;
    return h ? h.textContent.trim() : "";
  }

  function frame(sel, opts) {
    opts = opts || {};
    var node = d3.select(sel).node();
    var width = Math.max(320, (node ? node.clientWidth : 720) || 720);
    var height = opts.height || 340;
    var m0 = opts.margin || { top: 18, right: 20, bottom: 40, left: 56 };
    // Fixed pixel margins designed for a 1280px page leave ~48px of plot at 375px,
    // where ticks overprint and axis titles clip. Shrink them on narrow viewports
    // only -- on a desktop these Math.min calls are no-ops.
    var m = {
      top: m0.top, bottom: m0.bottom,
      left: Math.min(m0.left, Math.max(70, width * 0.30)),
      right: Math.min(m0.right, Math.max(16, width * 0.12))
    };
    var svg = d3.select(sel).append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("width", "100%")
      .attr("height", height)
      .attr("role", "img");
    // role="img" hides the subtree from assistive tech, so it MUST carry a name.
    var label = opts.label || nearestHeading(node);
    if (label) {
      svg.attr("aria-label", label);
      svg.append("title").text(label);
    }
    var g = svg.append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");
    return {
      svg: svg, g: g, m: m, width: width, height: height,
      iw: width - m.left - m.right,
      ih: height - m.top - m.bottom
    };
  }

  function axes(f, x, y, xLabel, yLabel, xTickFmt) {
    var xa = d3.axisBottom(x).ticks(6);
    if (xTickFmt) xa.tickFormat(xTickFmt);
    f.g.append("g")
      .attr("transform", "translate(0," + f.ih + ")")
      .call(xa)
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.g.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.g.append("g").attr("class", "grid")
      .selectAll("line").data(y.ticks(6)).enter().append("line")
      .attr("x1", 0).attr("x2", f.iw)
      .attr("y1", function (d) { return y(d); })
      .attr("y2", function (d) { return y(d); })
      .attr("stroke", C.panel).attr("stroke-width", 0.6).attr("opacity", 0.75);
    if (xLabel) {
      f.svg.append("text")
        .attr("x", f.m.left + f.iw / 2).attr("y", f.height - 6)
        .attr("text-anchor", "middle").attr("fill", C.muted)
        .style("font-size", "11px").text(xLabel);
    }
    if (yLabel) {
      f.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(f.m.top + f.ih / 2)).attr("y", 14)
        .attr("text-anchor", "middle").attr("fill", C.muted)
        .style("font-size", "11px").text(yLabel);
    }
  }

  function tip() {
    var t = d3.select("body").select(".d3-tip");
    if (t.empty()) {
      t = d3.select("body").append("div").attr("class", "d3-tip")
        .style("position", "absolute").style("pointer-events", "none")
        .style("opacity", 0).style("background", C.bg)
        .style("border", "1px solid " + C.panel).style("border-radius", "6px")
        .style("padding", "6px 9px").style("font-size", "12px")
        .style("color", C.bright).style("max-width", "300px")
        .style("z-index", 50);
    }
    return t;
  }

  /* ── 1. Observed vs counterfactual paths ─────────────────────────────── */
  function paths(sel, D, stage) {
    clear(sel);
    var f = frame(sel, { height: 330 });
    var years = D.meta.years;
    var obs = D.outcome.treated;
    var cf = D.counterfactual[stage];
    var band = (stage === "scspill_sar") ? D.bands.scspill_sar : null;

    var vals = obs.concat(cf).filter(Number.isFinite);
    if (band) vals = vals.concat(band.lower, band.upper).filter(Number.isFinite);

    var x = d3.scaleLinear().domain(d3.extent(years)).range([0, f.iw]);
    var y = d3.scaleLinear().domain([d3.min(vals) - 6, d3.max(vals) + 6]).nice().range([f.ih, 0]);
    axes(f, x, y, "Year", "Packs per capita", d3.format("d"));

    if (band) {
      f.g.append("path")
        .datum(years.map(function (yr, i) { return { yr: yr, lo: band.lower[i], hi: band.upper[i] }; })
          .filter(function (d) { return Number.isFinite(d.lo) && Number.isFinite(d.hi); }))
        .attr("fill", STAGE_COLOR[stage]).attr("opacity", 0.16)
        .attr("d", d3.area().x(function (d) { return x(d.yr); })
          .y0(function (d) { return y(d.lo); })
          .y1(function (d) { return y(d.hi); }));
    }

    var line = d3.line()
      .defined(function (d) { return Number.isFinite(d[1]); })
      .x(function (d) { return x(d[0]); })
      .y(function (d) { return y(d[1]); });

    f.g.append("path").datum(years.map(function (yr, i) { return [yr, obs[i]]; }))
      .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.4).attr("d", line);
    f.g.append("path").datum(years.map(function (yr, i) { return [yr, cf[i]]; }))
      .attr("fill", "none").attr("stroke", STAGE_COLOR[stage]).attr("stroke-width", 2.2)
      .attr("stroke-dasharray", "6 4").attr("d", line);

    f.g.append("line")
      .attr("x1", x(D.meta.treat_year - 0.5)).attr("x2", x(D.meta.treat_year - 0.5))
      .attr("y1", 0).attr("y2", f.ih)
      .attr("stroke", C.muted).attr("stroke-dasharray", "4 4");

    var lg = f.g.append("g").attr("transform", "translate(8,6)");
    [["California (observed)", C.orange, false],
     [STAGE_LABEL[stage], STAGE_COLOR[stage], true]].forEach(function (d, i) {
      lg.append("line").attr("x1", 0).attr("x2", 22).attr("y1", i * 16).attr("y2", i * 16)
        .attr("stroke", d[1]).attr("stroke-width", 2.4)
        .attr("stroke-dasharray", d[2] ? "6 4" : null);
      lg.append("text").attr("x", 28).attr("y", i * 16 + 4).attr("fill", C.text)
        .style("font-size", "11px").text(d[0]);
    });
  }

  /* ── 2. The gap ──────────────────────────────────────────────────────── */
  function gap(sel, D, stage) {
    clear(sel);
    var f = frame(sel, { height: 230 });
    var years = D.meta.years;
    var obs = D.outcome.treated;
    var cf = D.counterfactual[stage];
    var g = years.map(function (yr, i) { return { yr: yr, v: obs[i] - cf[i] }; })
      .filter(function (d) { return Number.isFinite(d.v); });

    var x = d3.scaleLinear().domain(d3.extent(years)).range([0, f.iw]);
    var ext = d3.extent(g, function (d) { return d.v; });
    var y = d3.scaleLinear().domain([Math.min(ext[0], 0) - 3, Math.max(ext[1], 0) + 3])
      .nice().range([f.ih, 0]);
    axes(f, x, y, "Year", "Observed − synthetic", d3.format("d"));

    f.g.append("path")
      .datum(g.filter(function (d) { return d.yr >= D.meta.treat_year; }))
      .attr("fill", STAGE_COLOR[stage]).attr("opacity", 0.18)
      .attr("d", d3.area().x(function (d) { return x(d.yr); })
        .y0(y(0)).y1(function (d) { return y(d.v); }));

    f.g.append("line").attr("x1", 0).attr("x2", f.iw).attr("y1", y(0)).attr("y2", y(0))
      .attr("stroke", C.muted).attr("stroke-width", 1);
    f.g.append("line")
      .attr("x1", x(D.meta.treat_year - 0.5)).attr("x2", x(D.meta.treat_year - 0.5))
      .attr("y1", 0).attr("y2", f.ih).attr("stroke", C.muted).attr("stroke-dasharray", "4 4");
    f.g.append("path").datum(g)
      .attr("fill", "none").attr("stroke", STAGE_COLOR[stage]).attr("stroke-width", 2.2)
      .attr("d", d3.line().x(function (d) { return x(d.yr); }).y(function (d) { return y(d.v); }));
  }

  /* ── 3. Forest plot over every estimator ─────────────────────────────── */
  function forest(sel, D) {
    clear(sel);
    var rows = [];
    (D.ladder || []).forEach(function (r) {
      if (!Number.isFinite(r.att)) return;
      rows.push({ label: r.stage, att: r.att, lo: r.lo95, hi: r.hi95,
                  comparable: true, note: r.engine + " — " + (r.note || ""),
                  core: true });
    });
    (D.benchmark || []).forEach(function (r) {
      if (r.status !== "ok" || !Number.isFinite(r.att)) return;
      rows.push({ label: String(r.label).split(" — ")[0], att: r.att,
                  lo: r.lo95, hi: r.hi95, comparable: !!r.comparable,
                  note: r.estimand, core: false });
    });
    if (!rows.length) { d3.select(sel).append("p").attr("class", "muted").text("No estimates available."); return; }

    var f = frame(sel, { height: Math.max(260, 26 * rows.length + 60),
                         margin: { top: 14, right: 24, bottom: 42, left: 190 } });
    // ISCM's interval spans [-136, +61] and is marked not-comparable. Letting it
    // set the domain compresses the five estimates a reader came for into ~14px,
    // so scale to the comparable rows and let the rest clip.
    var scaleRows = rows.filter(function (d) { return d.comparable; });
    if (!scaleRows.length) scaleRows = rows;
    var lo = d3.min(scaleRows, function (d) { return Number.isFinite(d.lo) ? d.lo : d.att; });
    var hi = d3.max(scaleRows, function (d) { return Number.isFinite(d.hi) ? d.hi : d.att; });
    var pad = (hi - lo) * 0.08 + 1;
    var x = d3.scaleLinear().domain([Math.min(lo - pad, 0), Math.max(hi + pad, 0)]).nice().range([0, f.iw]);
    var y = d3.scalePoint().domain(rows.map(function (d, i) { return i; })).range([0, f.ih]).padding(0.6);

    f.g.append("g").attr("transform", "translate(0," + f.ih + ")")
      .call(d3.axisBottom(x).ticks(7))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.svg.append("text").attr("x", f.m.left + f.iw / 2).attr("y", f.height - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px")
      .text("ATT (packs per capita per year)");

    f.g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", f.ih)
      .attr("stroke", C.muted).attr("stroke-dasharray", "3 3");

    var t = tip();
    // Anything outside the comparable-rows domain is pinned to the edge rather than
    // drawn off-plot, and marked with a chevron so it never reads as an in-range value.
    var dom = x.domain();
    function cx(v) { return x(Math.max(dom[0], Math.min(dom[1], v))); }
    function offScale(v) { return Number.isFinite(v) && (v < dom[0] || v > dom[1]); }

    rows.forEach(function (d, i) {
      var col = d.comparable ? (d.core ? C.teal : C.steel) : C.muted;
      var yy = y(i);
      if (Number.isFinite(d.lo) && Number.isFinite(d.hi)) {
        f.g.append("line").attr("x1", cx(d.lo)).attr("x2", cx(d.hi))
          .attr("y1", yy).attr("y2", yy).attr("stroke", col).attr("stroke-width", 2.2)
          .attr("opacity", 0.8);
        [[d.lo, -1], [d.hi, 1]].forEach(function (e) {
          if (!offScale(e[0])) return;
          f.g.append("path")
            .attr("d", "M0,-4 L" + (5 * e[1]) + ",0 L0,4 Z")
            .attr("transform", "translate(" + cx(e[0]) + "," + yy + ")")
            .attr("fill", col).attr("opacity", 0.8);
        });
      }
      f.g.append("circle").attr("cx", cx(d.att)).attr("cy", yy).attr("r", d.core ? 6 : 4.5)
        .attr("fill", col)
        .attr("stroke", offScale(d.att) ? C.bright : "none")
        .attr("stroke-dasharray", offScale(d.att) ? "2 2" : null)
        .on("mousemove", function (ev) {
          t.style("opacity", 1)
            .html("<strong>" + esc(d.label) + "</strong><br>ATT " + d.att.toFixed(3) +
                  (Number.isFinite(d.lo) ? "<br>95% CrI [" + d.lo.toFixed(2) + ", " + d.hi.toFixed(2) + "]" : "") +
                  (offScale(d.att) || offScale(d.lo) || offScale(d.hi)
                     ? "<br><em>off scale</em> — pinned to the axis edge" : "") +
                  "<br><em>" + (d.comparable ? "comparable" : "NOT comparable") + "</em>: " + esc(d.note))
            .style("left", (ev.pageX + 12) + "px").style("top", (ev.pageY - 10) + "px");
        })
        .on("mouseleave", function () { t.style("opacity", 0); });
      f.g.append("text").attr("x", -8).attr("y", yy + 4).attr("text-anchor", "end")
        .attr("fill", d.comparable ? C.text : C.muted).style("font-size", "11px")
        .text(d.label.length > 30 ? d.label.slice(0, 29) + "…" : d.label);
    });
  }

  /* ── 4. Simplex vs horseshoe dumbbell ────────────────────────────────── */
  function dumbbell(sel, D, opts) {
    clear(sel);
    opts = opts || {};
    var donors = D.meta.donors.slice();
    var simplex = D.weights.classical || {};
    var alpha = D.weights.alpha_mean || {};
    var alo = D.weights.alpha_lo || {};
    var ahi = D.weights.alpha_hi || {};
    var bscm = D.weights.bscm_mean || {};

    if (opts.sort === "alpha") donors.sort(function (a, b) { return (alpha[b] || 0) - (alpha[a] || 0); });
    else if (opts.sort === "name") donors.sort(d3.ascending);
    else donors.sort(function (a, b) { return (simplex[b] || 0) - (simplex[a] || 0); });

    var f = frame(sel, { height: Math.max(360, 17 * donors.length + 50),
                         margin: { top: 14, right: 24, bottom: 42, left: 116 } });
    var all = [];
    donors.forEach(function (s) {
      [simplex[s], alpha[s], alo[s], ahi[s]].forEach(function (v) { if (Number.isFinite(v)) all.push(v); });
      if (opts.showBscm && Number.isFinite(bscm[s])) all.push(bscm[s]);
    });
    var x = d3.scaleLinear().domain(d3.extent(all)).nice().range([0, f.iw]);
    var y = d3.scalePoint().domain(donors).range([0, f.ih]).padding(0.5);

    f.g.append("g").attr("transform", "translate(0," + f.ih + ")")
      .call(d3.axisBottom(x).ticks(7))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.svg.append("text").attr("x", f.m.left + f.iw / 2).attr("y", f.height - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px")
      .text("Donor weight");
    f.g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", f.ih)
      .attr("stroke", C.muted).attr("stroke-dasharray", "3 3");

    var t = tip();
    donors.forEach(function (s) {
      var yy = y(s), a = alpha[s], sx = simplex[s] || 0;
      if (Number.isFinite(alo[s]) && Number.isFinite(ahi[s])) {
        f.g.append("line").attr("x1", x(alo[s])).attr("x2", x(ahi[s]))
          .attr("y1", yy).attr("y2", yy).attr("stroke", C.panel).attr("stroke-width", 4);
      }
      if (Number.isFinite(a)) {
        f.g.append("line").attr("x1", x(sx)).attr("x2", x(a)).attr("y1", yy).attr("y2", yy)
          .attr("stroke", C.donor).attr("stroke-width", 1.2);
      }
      f.g.append("circle").attr("cx", x(sx)).attr("cy", yy).attr("r", 4).attr("fill", C.orange);
      if (Number.isFinite(a)) {
        f.g.append("circle").attr("cx", x(a)).attr("cy", yy).attr("r", 4).attr("fill", C.teal);
      }
      if (opts.showBscm && Number.isFinite(bscm[s])) {
        f.g.append("rect").attr("x", x(bscm[s]) - 3).attr("y", yy - 3)
          .attr("width", 6).attr("height", 6).attr("fill", C.gold);
      }
      f.g.append("text").attr("x", -8).attr("y", yy + 4).attr("text-anchor", "end")
        .attr("fill", sx > 1e-4 ? C.bright : C.muted).style("font-size", "10px").text(s);
      f.g.append("rect").attr("x", 0).attr("y", yy - 7).attr("width", f.iw).attr("height", 14)
        .attr("fill", "transparent")
        .on("mousemove", function (ev) {
          t.style("opacity", 1).html(
            "<strong>" + esc(s) + "</strong><br>simplex " + sx.toFixed(4) +
            "<br>horseshoe " + (Number.isFinite(a) ? a.toFixed(4) : "—") +
            (Number.isFinite(alo[s]) ? "<br>95% CrI [" + alo[s].toFixed(3) + ", " + ahi[s].toFixed(3) + "]" : "") +
            (opts.showBscm && Number.isFinite(bscm[s]) ? "<br>BSCM " + bscm[s].toFixed(4) : ""))
            .style("left", (ev.pageX + 12) + "px").style("top", (ev.pageY - 10) + "px");
        })
        .on("mouseleave", function () { t.style("opacity", 0); });
    });

    // Bottom-left, not top-left: at top-left this overlapped Utah and Montana,
    // the two largest weights in the chart.
    var lg = f.g.append("g").attr("transform", "translate(6," + (f.ih - 6) + ")");
    var items = [["simplex", C.orange], ["horseshoe posterior mean", C.teal]];
    if (opts.showBscm) items.push(["BSCM", C.gold]);
    items.forEach(function (d, i) {
      lg.append("circle").attr("cx", 4).attr("cy", (i - items.length + 1) * 15).attr("r", 4).attr("fill", d[1]);
      lg.append("text").attr("x", 14).attr("y", (i - items.length + 1) * 15 + 4).attr("fill", C.text)
        .style("font-size", "11px").text(d[0]);
    });
  }

  /* ── 5. Tile-grid cartogram ──────────────────────────────────────────── */
  function tiles(sel, D, values, opts) {
    clear(sel);
    opts = opts || {};
    var T = D.tiles || {};
    var names = Object.keys(T);
    if (!names.length) { d3.select(sel).append("p").attr("class", "muted").text("No tile layout."); return; }

    var rows = d3.max(names, function (s) { return T[s][0]; }) + 1;
    var cols = d3.max(names, function (s) { return T[s][1]; }) + 1;
    var node = d3.select(sel).node();
    var width = Math.max(320, (node ? node.clientWidth : 720) || 720);
    var cell = Math.min(Math.floor((width - 90) / cols), 54);
    var height = rows * cell + 34;

    var svg = d3.select(sel).append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("width", "100%").attr("height", height);

    var vmax = opts.vmax || d3.max(Object.keys(values), function (s) { return Math.abs(values[s]); }) || 1;
    var color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, vmax]);
    var t = tip();

    names.forEach(function (s) {
      var r = T[s][0], c = T[s][1];
      var v = values[s];
      var isTreated = (s === D.meta.treated);
      var inPool = Object.prototype.hasOwnProperty.call(values, s);
      var fill = isTreated ? C.orange : (inPool && Number.isFinite(v) ? color(Math.abs(v)) : C.panel);
      svg.append("rect")
        .attr("x", 12 + c * cell).attr("y", 8 + r * cell)
        .attr("width", cell - 3).attr("height", cell - 3).attr("rx", 3)
        .attr("fill", fill)
        .attr("stroke", isTreated ? C.bright : C.bg)
        .attr("stroke-width", isTreated ? 2 : 1)
        .on("mousemove", function (ev) {
          t.style("opacity", 1).html("<strong>" + esc(s) + "</strong><br>" +
            (isTreated ? "treated unit" :
              (inPool && Number.isFinite(v) ? "spillover " + v.toFixed(3) + " packs" : "not in the donor pool")))
            .style("left", (ev.pageX + 12) + "px").style("top", (ev.pageY - 10) + "px");
        })
        .on("mouseleave", function () { t.style("opacity", 0); });
      svg.append("text")
        .attr("x", 12 + c * cell + (cell - 3) / 2).attr("y", 8 + r * cell + (cell - 3) / 2 + 4)
        .attr("text-anchor", "middle").style("font-size", "10px").style("font-weight", "700")
        // Contrast follows the tile it sits on, not the value. Nevada is 11x the
        // next donor, so a value threshold leaves almost every label grey-on-pale.
        .attr("fill", isTreated ? "#141413"
          : (inPool && Number.isFinite(v)
              ? (d3.hsl(fill).l > 0.55 ? "#141413" : "#f5f7fa")
              : C.muted))
        .attr("pointer-events", "none")
        .text(D.postal && D.postal[s] ? D.postal[s] : s.slice(0, 2).toUpperCase());
    });

    // Colour ramp legend
    var lw = 130, lx = width - lw - 16, ly = height - 22;
    var defs = svg.append("defs");
    var grad = defs.append("linearGradient").attr("id", "ramp-" + Math.random().toString(36).slice(2));
    d3.range(0, 1.01, 0.1).forEach(function (p) {
      grad.append("stop").attr("offset", (p * 100) + "%").attr("stop-color", color(p * vmax));
    });
    svg.append("rect").attr("x", lx).attr("y", ly).attr("width", lw).attr("height", 9)
      .attr("fill", "url(#" + grad.attr("id") + ")");
    svg.append("text").attr("x", lx).attr("y", ly - 4).attr("fill", C.muted)
      .style("font-size", "10px").text("0");
    svg.append("text").attr("x", lx + lw).attr("y", ly - 4).attr("text-anchor", "end")
      .attr("fill", C.muted).style("font-size", "10px").text("|spillover| " + vmax.toFixed(1));
  }

  /* ── 6. Horizontal ranked bars ───────────────────────────────────────── */
  function hbars(sel, items, opts) {
    clear(sel);
    opts = opts || {};
    if (!items.length) { d3.select(sel).append("p").attr("class", "muted").text("Nothing to show."); return; }
    var f = frame(sel, { height: Math.max(200, 24 * items.length + 50),
                         margin: { top: 10, right: 60, bottom: 40, left: 104 } });
    var vals = items.map(function (d) { return d.value; });
    var x = d3.scaleLinear().domain([Math.min(0, d3.min(vals)) * 1.12, Math.max(0, d3.max(vals)) * 1.12])
      .nice().range([0, f.iw]);
    var y = d3.scaleBand().domain(items.map(function (d) { return d.name; }))
      .range([0, f.ih]).padding(0.24);

    f.g.append("g").attr("transform", "translate(0," + f.ih + ")")
      .call(d3.axisBottom(x).ticks(6))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.svg.append("text").attr("x", f.m.left + f.iw / 2).attr("y", f.height - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px")
      .text(opts.xLabel || "");

    items.forEach(function (d) {
      var w = Math.abs(x(d.value) - x(0));
      f.g.append("rect")
        .attr("x", Math.min(x(0), x(d.value))).attr("y", y(d.name))
        .attr("width", w).attr("height", y.bandwidth())
        .attr("fill", d.value < 0 ? C.orange : C.teal).attr("opacity", 0.9);
      f.g.append("text").attr("x", -8).attr("y", y(d.name) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end").attr("fill", C.text).style("font-size", "11px").text(d.name);
      f.g.append("text")
        .attr("x", x(d.value) + (d.value < 0 ? -6 : 6))
        .attr("y", y(d.name) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", d.value < 0 ? "end" : "start")
        .attr("fill", C.muted).style("font-size", "10.5px").text(d3.format("+.3f")(d.value));
    });
    f.g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", f.ih)
      .attr("stroke", C.muted);
  }

  /* ── 7. MCMC traces with a thinning control ──────────────────────────── */
  function trace(sel, series, opts) {
    clear(sel);
    opts = opts || {};
    var f = frame(sel, { height: 300 });
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values); });
    all = all.filter(Number.isFinite);
    if (!all.length) { d3.select(sel).append("p").attr("class", "muted").text("No draws."); return; }
    var n = d3.max(series, function (s) { return s.values.length; });
    var x = d3.scaleLinear().domain([0, n]).range([0, f.iw]);
    var y = d3.scaleLinear().domain(d3.extent(all)).nice().range([f.ih, 0]);
    axes(f, x, y, "Retained draw (thinned)", "ρ");

    series.forEach(function (s) {
      f.g.append("path")
        .datum(s.values.map(function (v, i) { return [i, v]; })
          .filter(function (d) { return Number.isFinite(d[1]); }))
        .attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 0.7)
        .attr("opacity", s.opacity == null ? 0.85 : s.opacity)
        .attr("d", d3.line().x(function (d) { return x(d[0]); }).y(function (d) { return y(d[1]); }));
    });
    if (Number.isFinite(opts.hline)) {
      f.g.append("line").attr("x1", 0).attr("x2", f.iw)
        .attr("y1", y(opts.hline)).attr("y2", y(opts.hline))
        .attr("stroke", C.bright).attr("stroke-dasharray", "5 4").attr("stroke-width", 1.2);
    }
    var lg = f.g.append("g").attr("transform", "translate(8,4)");
    series.forEach(function (s, i) {
      lg.append("line").attr("x1", 0).attr("x2", 20).attr("y1", i * 15).attr("y2", i * 15)
        .attr("stroke", s.color).attr("stroke-width", 2.2);
      lg.append("text").attr("x", 26).attr("y", i * 15 + 4).attr("fill", C.text)
        .style("font-size", "11px").text(s.label);
    });
  }

  /* ── 8. Interval-width comparison ────────────────────────────────────── */
  function widths(sel, rows) {
    clear(sel);
    if (!rows.length) { d3.select(sel).append("p").attr("class", "muted").text("No reconciliation rows."); return; }
    var f = frame(sel, { height: Math.max(220, 30 * rows.length + 56),
                         margin: { top: 12, right: 72, bottom: 42, left: 200 } });
    var x = d3.scaleLinear().domain([0, d3.max(rows, function (d) { return d.width; }) * 1.14]).nice()
      .range([0, f.iw]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.label; })).range([0, f.ih]).padding(0.28);

    f.g.append("g").attr("transform", "translate(0," + f.ih + ")")
      .call(d3.axisBottom(x).ticks(6))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.svg.append("text").attr("x", f.m.left + f.iw / 2).attr("y", f.height - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px")
      .text("Width of the 95% credible interval (packs)");

    var t = tip();
    rows.forEach(function (d) {
      f.g.append("rect").attr("x", 0).attr("y", y(d.label))
        .attr("width", x(d.width)).attr("height", y.bandwidth())
        .attr("fill", d.highlight ? C.teal : C.steel).attr("opacity", d.highlight ? 0.95 : 0.6)
        .on("mousemove", function (ev) {
          t.style("opacity", 1).html("<strong>" + esc(d.label) + "</strong><br>width " +
            d.width.toFixed(3) + "<br>ESS(ρ) " +
            (Number.isFinite(d.ess) ? d.ess.toFixed(1) : "—"))
            .style("left", (ev.pageX + 12) + "px").style("top", (ev.pageY - 10) + "px");
        })
        .on("mouseleave", function () { t.style("opacity", 0); });
      f.g.append("text").attr("x", -8).attr("y", y(d.label) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end").attr("fill", C.text).style("font-size", "11px")
        .text(d.label.length > 32 ? d.label.slice(0, 31) + "…" : d.label);
      f.g.append("text").attr("x", x(d.width) + 6).attr("y", y(d.label) + y.bandwidth() / 2 + 4)
        .attr("fill", C.muted).style("font-size", "10.5px").text(d.width.toFixed(2));
    });
  }

  /* ── 9. Budget ladder: ATT and ESS against chain length ──────────────── */
  function budget(sel, rows) {
    clear(sel);
    if (!rows.length) { d3.select(sel).append("p").attr("class", "muted").text("No budget ladder."); return; }
    var f = frame(sel, { height: 300, margin: { top: 18, right: 58, bottom: 44, left: 58 } });
    var x = d3.scaleLog().domain(d3.extent(rows, function (d) { return d.m_iter; })).range([0, f.iw]);
    var yl = d3.scaleLinear()
      .domain([d3.min(rows, function (d) { return d.lo95; }), d3.max(rows, function (d) { return d.hi95; })])
      .nice().range([f.ih, 0]);
    var yr = d3.scaleLinear().domain([0, d3.max(rows, function (d) { return d.rho_ess; }) * 1.1])
      .nice().range([f.ih, 0]);

    f.g.append("g").attr("transform", "translate(0," + f.ih + ")")
      .call(d3.axisBottom(x).ticks(5, "~s"))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.text).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.g.append("g").call(d3.axisLeft(yl).ticks(5))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.teal).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.g.append("g").attr("transform", "translate(" + f.iw + ",0)")
      .call(d3.axisRight(yr).ticks(5))
      .call(function (s) {
        s.selectAll("text").attr("fill", C.gold).style("font-size", "11px");
        s.selectAll("line,path").attr("stroke", C.panel);
      });
    f.svg.append("text").attr("x", f.m.left + f.iw / 2).attr("y", f.height - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).style("font-size", "11px")
      .text("MCMC iterations (log scale)  —  teal: ATT and its interval   gold: ESS(ρ)");

    f.g.append("path").datum(rows)
      .attr("fill", C.teal).attr("opacity", 0.15)
      .attr("d", d3.area().x(function (d) { return x(d.m_iter); })
        .y0(function (d) { return yl(d.lo95); }).y1(function (d) { return yl(d.hi95); }));
    f.g.append("path").datum(rows)
      .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2.2)
      .attr("d", d3.line().x(function (d) { return x(d.m_iter); }).y(function (d) { return yl(d.att); }));
    f.g.append("path").datum(rows)
      .attr("fill", "none").attr("stroke", C.gold).attr("stroke-width", 2.2)
      .attr("stroke-dasharray", "5 3")
      .attr("d", d3.line().x(function (d) { return x(d.m_iter); }).y(function (d) { return yr(d.rho_ess); }));

    f.g.append("line").attr("x1", 0).attr("x2", f.iw)
      .attr("y1", yr(100)).attr("y2", yr(100))
      .attr("stroke", C.bright).attr("stroke-dasharray", "4 4").attr("opacity", 0.6);
    f.g.append("text").attr("x", f.iw - 4).attr("y", yr(100) - 5).attr("text-anchor", "end")
      .attr("fill", C.bright).style("font-size", "10px").text("ESS = 100");

    rows.forEach(function (d) {
      f.g.append("circle").attr("cx", x(d.m_iter)).attr("cy", yl(d.att)).attr("r", 4).attr("fill", C.teal);
      f.g.append("circle").attr("cx", x(d.m_iter)).attr("cy", yr(d.rho_ess)).attr("r", 3.5).attr("fill", C.gold);
    });
  }

  window.Charts = {
    colors: C,
    stageColor: STAGE_COLOR,
    stageLabel: STAGE_LABEL,
    paths: paths,
    gap: gap,
    forest: forest,
    dumbbell: dumbbell,
    tiles: tiles,
    hbars: hbars,
    trace: trace,
    widths: widths,
    budget: budget
  };
})(window);
