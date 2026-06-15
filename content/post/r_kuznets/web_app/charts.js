/* charts.js — D3 v7 chart builders for the Spatial Kuznets lab. */
(function (global) {
  "use strict";
  var STEEL = "#6a9bcc", ORANGE = "#d97757", TEAL = "#00d4c8",
      NAVY = "#0f1729", PANEL = "#1f2b5e", LIGHT = "#c8d0e0", LIGHTER = "#e8ecf2";
  var D = global.KuzDGP;

  function frame(sel, w, h, m) {
    d3.select(sel).selectAll("*").remove();
    var svg = d3.select(sel).append("svg")
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("width", "100%").style("max-width", w + "px").style("height", "auto");
    var g = svg.append("g").attr("transform", "translate(" + m.l + "," + m.t + ")");
    return { svg: svg, g: g, iw: w - m.l - m.r, ih: h - m.t - m.b };
  }
  function axes(g, x, y, iw, ih, xlab, ylab) {
    g.append("g").attr("transform", "translate(0," + ih + ")")
      .call(d3.axisBottom(x).ticks(6)).attr("color", LIGHT);
    g.append("g").call(d3.axisLeft(y).ticks(6)).attr("color", LIGHT);
    g.append("text").attr("x", iw / 2).attr("y", ih + 38).attr("fill", LIGHT)
      .attr("text-anchor", "middle").style("font-size", "13px").text(xlab);
    g.append("text").attr("transform", "rotate(-90)").attr("x", -ih / 2).attr("y", -42)
      .attr("fill", LIGHT).attr("text-anchor", "middle").style("font-size", "13px").text(ylab);
  }

  // ---- a small fixed synthetic scatter so the morph has data behind it ----
  var SCATTER = (function () {
    var rng = 12345, pts = [];
    function rand() { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; }
    var c = { intercept: -11.84, b1: 4.0, b2: -0.45, b3: 0.017 };
    for (var i = 0; i < 56; i++) {
      var x = 5.9 + 5.4 * rand();
      pts.push({ x: x, y: Math.max(0.03, D.cubic(x, c) + (rand() - 0.5) * 0.28) });
    }
    return pts;
  })();

  // TAB 1 — morph animation line -> quadratic -> cubic
  function morph(sel, coefStages, playBtn) {
    var f = frame(sel, 620, 380, { l: 56, r: 20, t: 18, b: 46 });
    var x = d3.scaleLinear().domain([5.8, 11.4]).range([0, f.iw]);
    var y = d3.scaleLinear().domain([0, 0.95]).range([f.ih, 0]);
    axes(f.g, x, y, f.iw, f.ih, "ln(GDP per capita)", "WCV");
    f.g.selectAll("circle").data(SCATTER).enter().append("circle")
      .attr("cx", function (d) { return x(d.x); }).attr("cy", function (d) { return y(d.y); })
      .attr("r", 3.4).attr("fill", STEEL).attr("opacity", 0.8);
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); }).curve(d3.curveBasis);
    var path = f.g.append("path").attr("fill", "none").attr("stroke", ORANGE).attr("stroke-width", 3);
    var label = f.g.append("text").attr("x", 6).attr("y", 16).attr("fill", LIGHTER).style("font-size", "14px").style("font-weight", "600");
    var names = ["Linear", "Quadratic", "Cubic (N-shape)"];
    function draw(c) { path.attr("d", line(D.curvePoints(c, 5.85, 11.35, 120))); }
    draw(coefStages[0]); label.text(names[0]);
    function animate(stage) {
      if (stage >= coefStages.length - 1) { return; }
      var a = coefStages[stage], b = coefStages[stage + 1], t0 = Date.now();
      label.text(names[stage + 1]);
      d3.timer(function () {
        var t = Math.min(1, (Date.now() - t0) / 900);
        draw(D.lerpCoef(a, b, t));
        if (t >= 1) { setTimeout(function () { animate(stage + 1); }, 550); return true; }
      });
    }
    if (playBtn) d3.select(playBtn).on("click", function () { draw(coefStages[0]); label.text(names[0]); setTimeout(function () { animate(0); }, 250); });
  }

  // TAB 2 — three-region bar chart + mean line
  function wcvBars(sel, regions) {
    var f = frame(sel, 520, 320, { l: 60, r: 16, t: 16, b: 46 });
    var x = d3.scaleBand().domain(regions.map(function (_, i) { return "R" + (i + 1); })).range([0, f.iw]).padding(0.32);
    var y = d3.scaleLinear().domain([0, d3.max(regions, function (d) { return d.y; }) * 1.15]).range([f.ih, 0]);
    axes(f.g, x, y, f.iw, f.ih, "Region", "GDP per capita ($)");
    var s = regions.reduce(function (a, d) { return a + d.p; }, 0);
    var ybar = regions.reduce(function (a, d) { return a + d.y * d.p / s; }, 0);
    f.g.selectAll("rect").data(regions).enter().append("rect")
      .attr("x", function (_, i) { return x("R" + (i + 1)); }).attr("width", x.bandwidth())
      .attr("y", function (d) { return y(d.y); }).attr("height", function (d) { return f.ih - y(d.y); })
      .attr("fill", function (_, i) { return [STEEL, ORANGE, TEAL][i]; }).attr("rx", 4);
    f.g.selectAll(".plab").data(regions).enter().append("text").attr("class", "plab")
      .attr("x", function (_, i) { return x("R" + (i + 1)) + x.bandwidth() / 2; })
      .attr("y", function (d) { return y(d.y) - 6; }).attr("text-anchor", "middle")
      .attr("fill", LIGHTER).style("font-size", "11px")
      .text(function (d) { return "$" + Math.round(d.y / 1000) + "k · " + Math.round(100 * d.p / s) + "%"; });
    f.g.append("line").attr("x1", 0).attr("x2", f.iw).attr("y1", y(ybar)).attr("y2", y(ybar))
      .attr("stroke", LIGHT).attr("stroke-dasharray", "5,4").attr("stroke-width", 1.5);
    f.g.append("text").attr("x", f.iw).attr("y", y(ybar) - 6).attr("text-anchor", "end")
      .attr("fill", LIGHT).style("font-size", "11px").text("weighted mean $" + Math.round(ybar).toLocaleString());
  }

  // TAB 3 — curve + turning-point markers
  function curve(sel, c) {
    var f = frame(sel, 560, 360, { l: 56, r: 18, t: 16, b: 46 });
    var x = d3.scaleLinear().domain([5.8, 11.4]).range([0, f.iw]);
    var pts = D.curvePoints(c, 5.85, 11.35, 160);
    var ext = d3.extent(pts, function (d) { return d.y; });
    var pad = (ext[1] - ext[0]) * 0.15 || 0.1;
    var y = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([f.ih, 0]);
    axes(f.g, x, y, f.iw, f.ih, "ln(GDP per capita)", "Fitted WCV");
    // shade the observed income range (~$365-$80,000) so out-of-range turns are visible
    var OBS_LO = 5.9, OBS_HI = 11.3;
    f.g.append("rect").attr("x", x(OBS_LO)).attr("width", x(OBS_HI) - x(OBS_LO))
      .attr("y", 0).attr("height", f.ih).attr("fill", "#ffffff").attr("opacity", 0.05);
    f.g.append("text").attr("x", x((OBS_LO + OBS_HI) / 2)).attr("y", f.ih - 6)
      .attr("text-anchor", "middle").attr("fill", LIGHT).style("font-size", "10px")
      .text("observed income range");
    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); });
    f.g.append("path").attr("d", line(pts)).attr("fill", "none").attr("stroke", ORANGE).attr("stroke-width", 3);
    var tp = D.turningPoints(c).filter(function (r) { return r > 5.8 && r < 11.4; });
    tp.forEach(function (r) {
      var inRange = r >= OBS_LO && r <= OBS_HI;
      var col = inRange ? TEAL : "#e0b050";          // teal = in range, amber = out of range
      f.g.append("line").attr("x1", x(r)).attr("x2", x(r)).attr("y1", 0).attr("y2", f.ih)
        .attr("stroke", col).attr("stroke-dasharray", "4,4").attr("stroke-width", 1.5);
      f.g.append("text").attr("x", x(r)).attr("y", 14).attr("text-anchor", "middle")
        .attr("fill", col).style("font-size", "11px")
        .text("$" + Math.round(Math.exp(r)).toLocaleString() + (inRange ? "" : " (out)"));
    });
    return tp;
  }

  // TAB 4 — forest plot OLS vs FE
  function forest(sel, rows) {
    var f = frame(sel, 620, 300, { l: 150, r: 30, t: 20, b: 46 });
    var lo = d3.min(rows, function (d) { return d.estimate - 1.96 * d.se; });
    var hi = d3.max(rows, function (d) { return d.estimate + 1.96 * d.se; });
    var span = hi - lo; var x = d3.scaleLinear().domain([lo - span * 0.1, hi + span * 0.1]).range([0, f.iw]);
    var y = d3.scaleBand().domain(rows.map(function (d) { return d.term + " · " + d.estimator; })).range([0, f.ih]).padding(0.4);
    f.g.append("g").attr("transform", "translate(0," + f.ih + ")").call(d3.axisBottom(x).ticks(6)).attr("color", LIGHT);
    f.g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", f.ih)
      .attr("stroke", LIGHT).attr("stroke-dasharray", "4,4").attr("opacity", 0.6);
    rows.forEach(function (d) {
      var yy = y(d.term + " · " + d.estimator) + y.bandwidth() / 2;
      var col = d.estimator.indexOf("FE") >= 0 ? ORANGE : STEEL;
      f.g.append("line").attr("x1", x(d.estimate - 1.96 * d.se)).attr("x2", x(d.estimate + 1.96 * d.se))
        .attr("y1", yy).attr("y2", yy).attr("stroke", col).attr("stroke-width", 2.5);
      f.g.append("circle").attr("cx", x(d.estimate)).attr("cy", yy).attr("r", 5).attr("fill", col);
      f.g.append("text").attr("x", -10).attr("y", yy + 4).attr("text-anchor", "end")
        .attr("fill", LIGHT).style("font-size", "11.5px").text(d.term + " · " + d.estimator.replace("Cross-section ", "").replace("Two-way ", ""));
      f.g.append("text").attr("x", x(d.estimate)).attr("y", yy - 9).attr("text-anchor", "middle")
        .attr("fill", LIGHTER).style("font-size", "11px").text(d.estimate.toFixed(3) + d.stars);
    });
    f.g.append("text").attr("x", f.iw / 2).attr("y", f.ih + 38).attr("fill", LIGHT)
      .attr("text-anchor", "middle").style("font-size", "13px").text("coefficient (95% interval)");
  }

  global.KuzCharts = { morph: morph, wcvBars: wcvBars, curve: curve, forest: forest };
})(window);
