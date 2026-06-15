/* app.js — tab switching, sliders and wiring for the Spatial Kuznets lab.
   All HTML inserted via innerHTML is self-generated (computed numbers and fixed
   strings), never user input — so there is no untrusted-content path here. */
(function () {
  "use strict";
  var C = window.KuzCharts, D = window.KuzDGP;
  var builders = {};                 // pane id -> build function
  var built = {};

  // ---- slider helper ----
  function slider(host, label, min, max, step, val, fmt, onInput) {
    var row = document.createElement("div"); row.className = "slider-row";
    var lab = document.createElement("label"); lab.textContent = label + "  ";
    var out = document.createElement("span"); out.className = "slider-val"; out.textContent = fmt(val);
    var inp = document.createElement("input");
    inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
    inp.addEventListener("input", function () { out.textContent = fmt(+inp.value); onInput(+inp.value); });
    lab.appendChild(out); row.appendChild(lab); row.appendChild(inp); host.appendChild(row);
    return inp;
  }

  // ---- TAB 1: intro morph ----
  var STAGES = [
    { intercept: 0.95, b1: -0.066, b2: 0, b3: 0 },             // linear (declining)
    { intercept: -2.2, b1: 0.62, b2: -0.035, b3: 0 },           // quadratic (inverted-U)
    { intercept: -11.84, b1: 4.0, b2: -0.45, b3: 0.017 }        // cubic (N-shape)
  ];
  builders["pane-intro"] = function () { C.morph("#intro-anim", STAGES, "#intro-play"); };

  // ---- TAB 2: WCV builder ----
  builders["pane-wcv"] = function () {
    var host = document.getElementById("wcv-sliders");
    var R = [{ y: 28000, p: 0.25 }, { y: 16000, p: 0.35 }, { y: 9000, p: 0.40 }];
    function redraw() {
      C.wcvBars("#wcv-chart", R);
      var w = D.wcv(R.map(function (d) { return d.y; }), R.map(function (d) { return d.p; }));
      document.getElementById("wcv-readout").innerHTML =
        "<span class='big'>WCV = " + w.toFixed(3) + "</span><br>" +
        "Higher when regions are more unequal <em>and</em> the gap falls on larger populations.";
    }
    R.forEach(function (d, i) {
      slider(host, "Region " + (i + 1) + " GDP p.c.", 3000, 40000, 500, d.y,
        function (v) { return "$" + v.toLocaleString(); }, function (v) { d.y = v; redraw(); });
      slider(host, "Region " + (i + 1) + " population share", 0.05, 0.8, 0.05, d.p,
        function (v) { return Math.round(v * 100) + "%"; }, function (v) { d.p = v; redraw(); });
    });
    redraw();
  };

  // ---- TAB 3: curve explorer ----
  builders["pane-curve"] = function () {
    var PAPER = { intercept: -11.84, b1: 4.397, b2: -0.499, b3: 0.0184 };
    var c = Object.assign({}, PAPER);
    var host = document.getElementById("curve-sliders");
    function readout() {
      var OBS_LO = 5.9, OBS_HI = 11.3;
      var Dval = D.discriminant(c);
      var allTp = D.turningPoints(c);                       // unfiltered (may be far out of range)
      var inRange = allTp.filter(function (r) { return r >= OBS_LO && r <= OBS_HI; });
      var regime, txt;
      if (Dval > 1e-6) {
        regime = "D = " + Dval.toFixed(4) + " &gt; 0 &rarr; two turning points";
        if (inRange.length === 2) {
          txt = "Both turning points lie inside the observed range &mdash; a genuine N-shape: peak near $" +
            Math.round(Math.exp(Math.min.apply(null, inRange))).toLocaleString() + ", trough near $" +
            Math.round(Math.exp(Math.max.apply(null, inRange))).toLocaleString() + ".";
        } else {
          txt = inRange.length + " of 2 turning points fall inside the observed income range &mdash; " +
            (inRange.length === 0 ? "over real incomes the curve looks monotonic."
                                  : "the curve bends only once in range.");
        }
      } else if (Math.abs(Dval) <= 1e-6) {
        regime = "D &asymp; 0 &rarr; inflection only";
        txt = "A single flat spot, but the curve does not reverse direction.";
      } else {
        regime = "D = " + Dval.toFixed(4) + " &lt; 0 &rarr; no turning points";
        txt = "The curve is monotonic &mdash; it never reverses, despite the cubic term.";
      }
      document.getElementById("curve-readout").innerHTML =
        "<span class='big'>&beta;&#8321;=" + c.b1.toFixed(2) + ", &beta;&#8322;=" + c.b2.toFixed(3) +
        ", &beta;&#8323;=" + c.b3.toFixed(4) + "  &middot;  " + regime + "</span><br>" + txt;
    }
    function redraw() { C.curve("#curve-chart", c); readout(); }
    var s1 = slider(host, "beta1 (linear)", -1, 6, 0.05, c.b1, function (v) { return v.toFixed(2); }, function (v) { c.b1 = v; redraw(); });
    var s2 = slider(host, "beta2 (quadratic)", -0.7, 0.1, 0.005, c.b2, function (v) { return v.toFixed(3); }, function (v) { c.b2 = v; redraw(); });
    var s3 = slider(host, "beta3 (cubic)", -0.01, 0.04, 0.001, c.b3, function (v) { return v.toFixed(4); }, function (v) { c.b3 = v; redraw(); });
    document.getElementById("curve-reset").addEventListener("click", function () {
      c = Object.assign({}, PAPER); s1.value = c.b1; s2.value = c.b2; s3.value = c.b3;
      s1.dispatchEvent(new Event("input")); s2.dispatchEvent(new Event("input")); s3.dispatchEvent(new Event("input"));
    });
    redraw();
  };

  // ---- TAB 4: forest plot ----
  var FOREST_FALLBACK = [
    { term: "ln(GDP)", estimator: "Cross-section OLS", estimate: 0.3384, se: 0.1736, stars: "*" },
    { term: "ln(GDP)", estimator: "Two-way FE", estimate: 0.3938, se: 0.1672, stars: "**" },
    { term: "ln(GDP)²", estimator: "Cross-section OLS", estimate: -0.0197, se: 0.0091, stars: "**" },
    { term: "ln(GDP)²", estimator: "Two-way FE", estimate: -0.0211, se: 0.0096, stars: "**" }
  ];
  builders["pane-forest"] = function () {
    fetch("data/results.json").then(function (r) { return r.json(); }).then(function (j) {
      C.forest("#forest-chart", j.forest);
      document.getElementById("forest-readout").innerHTML =
        "Cross-section cubic upturn is " + j.facts.cs_cubic_stars +
        "; the panel cubic is <strong>" + j.facts.panel_cubic + "</strong>.";
    }).catch(function () {
      C.forest("#forest-chart", FOREST_FALLBACK);
      document.getElementById("forest-readout").innerHTML =
        "The quadratic inverted-U is significant under both estimators.";
    });
  };

  // ---- tab strip wiring ----
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
      document.querySelectorAll(".tab-pane").forEach(function (p) { p.classList.remove("active"); });
      t.classList.add("active"); t.setAttribute("aria-selected", "true");
      document.getElementById(t.dataset.pane).classList.add("active");
      if (builders[t.dataset.pane] && !built[t.dataset.pane]) { builders[t.dataset.pane](); built[t.dataset.pane] = true; }
    });
  });

  // build the first (active) tab
  builders["pane-intro"](); built["pane-intro"] = true;
})();
