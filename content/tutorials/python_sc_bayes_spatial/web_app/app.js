/* app.js — tab routing and control wiring for the Bayesian spatial SC lab.
 *
 * All numbers come from data/results.json, which analysis.py bakes under
 * APP_DATA=1. Nothing is computed here that the script could have computed
 * once: the rho slider reads a precomputed sweep rather than running MCMC in
 * a browser.
 */
(function (window, document) {
  "use strict";

  var D = null;
  var C = window.Charts.colors;

  /* ── tab routing ─────────────────────────────────────────────────────── */
  function initTabs() {
    var btns = Array.prototype.slice.call(document.querySelectorAll(".tab-btn"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        Array.prototype.forEach.call(document.querySelectorAll(".tab-pane"), function (p) {
          p.classList.remove("active");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        var pane = document.getElementById(btn.getAttribute("aria-controls"));
        if (pane) pane.classList.add("active");
        redrawActive();
      });
    });
  }

  // Built with DOM methods and textContent rather than innerHTML. The values
  // are our own formatted numbers, but there is no reason to open an HTML
  // injection path when textContent costs nothing.
  function statTiles(sel, items) {
    var host = document.querySelector(sel);
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);
    // Class names come from the shared styles.css: .stat wraps .stat-label
    // (uppercase, above) and .stat-value (large, below).
    items.forEach(function (it) {
      var tile = document.createElement("div");
      tile.className = "stat";
      var l = document.createElement("div");
      l.className = "stat-label";
      // The label is uppercased in CSS, but CSS maps Greek rho to capital Rho,
      // which reads as a Latin P. Keep Latin in the transform, exempt the rest.
      String(it.l).split(/([^\u0000-\u024F]+)/).forEach(function (part, i) {
        if (!part) return;
        if (i % 2 === 1) {
          var sp = document.createElement("span");
          sp.className = "nocaps";
          sp.textContent = part;
          l.appendChild(sp);
        } else {
          l.appendChild(document.createTextNode(part));
        }
      });
      var v = document.createElement("div");
      v.className = "stat-value" + (it.accent ? " " + it.accent : "");
      v.textContent = String(it.v);
      tile.appendChild(l);
      tile.appendChild(v);
      host.appendChild(tile);
    });
  }

  function fmt(v, d) {
    return Number.isFinite(v) ? v.toFixed(d == null ? 2 : d) : "—";
  }

  /* ── tab 1: three stages ─────────────────────────────────────────────── */
  function currentStage() {
    var el = document.querySelector('input[name="stage"]:checked');
    return el ? el.value : "classical";
  }

  function drawStages() {
    var stage = currentStage();
    var years = D.meta.years;
    var obs = D.outcome.treated;
    var cf = D.counterfactual[stage];
    var post = years.map(function (y) { return y >= D.meta.treat_year; });
    var gaps = [];
    years.forEach(function (y, i) {
      if (post[i] && Number.isFinite(obs[i]) && Number.isFinite(cf[i])) gaps.push(obs[i] - cf[i]);
    });
    var att = gaps.length ? gaps.reduce(function (a, b) { return a + b; }, 0) / gaps.length : NaN;

    var row = (D.ladder || []).filter(function (r) {
      return (stage === "classical" && r.stage.indexOf("1.") === 0) ||
             (stage === "bscm" && r.stage.indexOf("2a") === 0) ||
             (stage === "scspill_rho0" && r.stage.indexOf("2b") === 0) ||
             (stage === "scspill_sar" && r.stage.indexOf("3.") === 0);
    })[0] || {};

    statTiles("#stage-stats", [
      { v: fmt(att), l: "ATT (packs per capita)", accent: "teal" },
      { v: Number.isFinite(row.lo95) ? "[" + fmt(row.lo95, 1) + ", " + fmt(row.hi95, 1) + "]" : "—",
        l: "95% interval" },
      { v: Number.isFinite(row.n_active) ? row.n_active : "—", l: "active donors" },
      { v: Number.isFinite(row.r_reference) ? fmt(row.r_reference) : "—", l: "R edition" }
    ]);

    window.Charts.paths("#chart-paths", D, stage);
    window.Charts.gap("#chart-gap", D, stage);
    window.Charts.forest("#chart-forest", D);
  }

  /* ── tab 2: who's in the blend ───────────────────────────────────────── */
  function drawBlend() {
    var sortEl = document.querySelector('input[name="sort"]:checked');
    var showB = document.getElementById("show-bscm");
    var simplex = D.weights.classical || {};
    var alpha = D.weights.alpha_mean || {};
    var alo = D.weights.alpha_lo || {};
    var ahi = D.weights.alpha_hi || {};

    var nSimplex = D.meta.donors.filter(function (s) { return (simplex[s] || 0) > 1e-4; }).length;
    var nAlpha = D.meta.donors.filter(function (s) { return Math.abs(alpha[s] || 0) > 0.01; }).length;
    var nExcl = D.meta.donors.filter(function (s) {
      return Number.isFinite(alo[s]) && Number.isFinite(ahi[s]) && (alo[s] > 0 || ahi[s] < 0);
    }).length;
    var sumS = D.meta.donors.reduce(function (a, s) { return a + (simplex[s] || 0); }, 0);

    statTiles("#blend-stats", [
      { v: nSimplex, l: "active under the simplex" },
      { v: nAlpha, l: "active under the horseshoe" },
      { v: nExcl, l: "intervals excluding zero" },
      { v: fmt(sumS, 3), l: "simplex weights sum" }
    ]);

    window.Charts.dumbbell("#chart-dumbbell", D, {
      sort: sortEl ? sortEl.value : "simplex",
      showBscm: !!(showB && showB.checked)
    });
  }

  /* ── tab 3: where it leaked ──────────────────────────────────────────── */
  function nearestSweep(rho) {
    var best = null, bd = Infinity;
    (D.rho_sweep || []).forEach(function (s) {
      var d = Math.abs(s.rho - rho);
      if (d < bd) { bd = d; best = s; }
    });
    return best;
  }

  function spilloversAt(rho) {
    // Spillovers scale essentially linearly in rho over this range; the panel
    // shipped in results.json is the fit at rho-hat, so rescale it. The
    // relative ranking -- which is what the map is for -- is exact.
    var hat = D.rho.hat || 1;
    var k = hat === 0 ? 0 : rho / hat;
    var out = {};
    Object.keys(D.spillover_mean || {}).forEach(function (s) {
      out[s] = (D.spillover_mean[s] || 0) * k;
    });
    return out;
  }

  function drawLeak() {
    var slider = document.getElementById("rho-slider");
    var rho = slider ? +slider.value : D.rho.hat;
    var out = document.getElementById("rho-out");
    if (out) out.textContent = rho.toFixed(2);

    var sw = nearestSweep(rho);
    var vals = spilloversAt(rho);
    var vmax = Math.max.apply(null, Object.keys(D.spillover_mean || {}).map(function (s) {
      return Math.abs(D.spillover_mean[s] || 0);
    }).concat([1e-9]));

    var total = Object.keys(vals).reduce(function (a, s) { return a + vals[s]; }, 0);
    statTiles("#leak-stats", [
      { v: sw ? fmt(sw.att) : "—", l: "ATT at this ρ", accent: "teal" },
      { v: Number.isFinite(vals["Nevada"]) ? fmt(vals["Nevada"]) : "—",
        l: "Nevada spillover", accent: "orange" },
      { v: fmt(total, 1), l: "total absorbed by donors" },
      { v: fmt(D.rho.hat, 3), l: "estimated ρ̂" }
    ]);

    window.Charts.tiles("#chart-tiles", D, vals, { vmax: vmax * (D.rho.hat ? rho / D.rho.hat : 1) || vmax });

    var items = Object.keys(vals)
      .map(function (s) { return { name: s, value: vals[s] }; })
      .sort(function (a, b) { return Math.abs(b.value) - Math.abs(a.value); })
      .slice(0, 10);          // largest first -> scaleBand puts it at the top
    // At rho = 0 every spillover is exactly zero, the sort is a no-op, and the
    // "ten largest" would be ten arbitrary states. Say so instead.
    var allZero = items.every(function (d) { return !(Math.abs(d.value) > 0); });
    if (allZero) {
      var host = document.querySelector("#chart-spillbars");
      if (host) {
        while (host.firstChild) host.removeChild(host.firstChild);
        var msg = document.createElement("p");
        msg.className = "lede";
        msg.textContent = "At \u03c1 = 0 the model imposes SUTVA: every donor's "
          + "spillover is exactly zero, so there is no ranking to draw.";
        host.appendChild(msg);
      }
    } else {
      window.Charts.hbars("#chart-spillbars", items,
        { xLabel: "Mean post-1988 spillover (packs per capita)" });
    }
  }

  /* ── tab 4: can you trust the interval? ──────────────────────────────── */
  function essOf(x) {
    // Initial-positive-sequence estimator (Geyer 1992), the standard one.
    var n = x.length;
    if (n < 8) return NaN;
    var mean = x.reduce(function (a, b) { return a + b; }, 0) / n;
    var c = new Array(n), v0 = 0;
    for (var i = 0; i < n; i++) { c[i] = x[i] - mean; }
    for (i = 0; i < n; i++) { v0 += c[i] * c[i]; }
    v0 /= n;
    if (v0 <= 0) return NaN;
    var sum = 0, maxLag = Math.min(n - 2, 2000);
    for (var lag = 1; lag <= maxLag; lag += 2) {
      var r1 = 0, r2 = 0;
      for (i = 0; i + lag < n; i++) r1 += c[i] * c[i + lag];
      for (i = 0; i + lag + 1 < n; i++) r2 += c[i] * c[i + lag + 1];
      r1 /= (n * v0); r2 /= (n * v0);
      var pair = r1 + r2;
      if (pair <= 0) break;
      sum += pair;
    }
    return n / (1 + 2 * sum);
  }

  function thinned(arr, k) {
    var out = [];
    for (var i = 0; i < arr.length; i += k) out.push(arr[i]);
    return out;
  }

  function drawTrust() {
    var ts = document.getElementById("thin-slider");
    var k = ts ? +ts.value : 1;
    var to = document.getElementById("thin-out");
    if (to) to.textContent = String(k);

    var corrected = thinned(D.rho.draws || [], k);
    var rspec = thinned(D.rho.rspec_draws || [], k);
    var essC = essOf(corrected);
    var essR = essOf(rspec);

    statTiles("#trust-stats", [
      { v: corrected.length.toLocaleString(), l: "draws retained (adaptive)" },
      { v: Number.isFinite(essC) ? essC.toFixed(0) : "—", l: "ESS, adaptive step", accent: "teal" },
      { v: Number.isFinite(essR) ? essR.toFixed(0) : "—", l: "ESS, fixed step", accent: "orange" },
      { v: fmt(D.rho.acc, 3), l: "acceptance rate (target 0.44)" }
    ]);

    window.Charts.trace("#chart-trace", [
      { label: "R specification (fixed step)", values: rspec, color: C.orange, opacity: 0.8 },
      { label: "Corrected (adaptive step)", values: corrected, color: C.teal, opacity: 0.9 }
    ], { hline: D.rho.hat });

    var rows = (D.reconciliation || [])
      .filter(function (r) { return Number.isFinite(r.lo95) && Number.isFinite(r.hi95); })
      .map(function (r) {
        return {
          label: r.spec + " (" + Number(r.m_iter).toLocaleString() + ")",
          width: r.hi95 - r.lo95,
          ess: r.rho_ess,
          highlight: /corrected/i.test(r.spec)
        };
      });
    window.Charts.widths("#chart-widths", rows);
    window.Charts.budget("#chart-budget", (D.budget || []).slice());
  }

  /* ── dispatch ────────────────────────────────────────────────────────── */
  function redrawActive() {
    if (!D) return;
    var pane = document.querySelector(".tab-pane.active");
    if (!pane) return;
    if (pane.id === "tab-stages") drawStages();
    else if (pane.id === "tab-blend") drawBlend();
    else if (pane.id === "tab-leak") drawLeak();
    else if (pane.id === "tab-trust") drawTrust();
  }

  function wire() {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="stage"]'), function (el) {
      el.addEventListener("change", drawStages);
    });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="sort"]'), function (el) {
      el.addEventListener("change", drawBlend);
    });
    var sb = document.getElementById("show-bscm");
    if (sb) sb.addEventListener("change", drawBlend);

    var rs = document.getElementById("rho-slider");
    if (rs) rs.addEventListener("input", drawLeak);
    var rr = document.getElementById("rho-reset");
    if (rr) {
      rr.addEventListener("click", function () {
        if (rs) { rs.value = String(D.rho.hat); drawLeak(); }
      });
    }
    var th = document.getElementById("thin-slider");
    if (th) th.addEventListener("input", drawTrust);

    var t = null;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(redrawActive, 180);
    });
  }

  function boot() {
    initTabs();
    fetch("data/results.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        D = json;
        var rs = document.getElementById("rho-slider");
        if (rs && Number.isFinite(D.rho && D.rho.hat)) {
          rs.value = String(Math.round(D.rho.hat * 50) / 50);
        }
        wire();
        redrawActive();
      })
      .catch(function (err) {
        var m = document.querySelector("main");
        if (!m) return;
        var card = document.createElement("div");
        card.className = "chart-card";
        var p = document.createElement("p");
        p.className = "muted";
        p.textContent = "Could not load data/results.json (" + err.message +
                        "). Rebuild it with: APP_DATA=1 python analysis.py";
        card.appendChild(p);
        m.insertBefore(card, m.firstChild);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
