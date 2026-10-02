/*!
 * panel-lab.js — inline interactive panel-data lab (two tabs).
 *
 * Loaded once per page by layouts/shortcodes/panel-lab.html through Hugo Pipes
 * (js.Build, target es2017, minified, fingerprinted). No dependencies.
 * Initializes every `.panel-lab[data-panel-lab]` element on the page.
 * Companion of content/post/python_panel_intro (union wage premium, T = 2).
 *
 * Tab A, "Selection lab": a simulated balanced panel, N = 2,199 workers, T = 2.
 *   worker effect   alpha_i = 0.55 * a_i,                a_i ~ N(0, 1)
 *   union propensity p_i   = rho * a_i + sqrt(1 - rho^2) * v_i,   v_i ~ N(0, 1)
 *   switchers       a random share s of workers (fixed order per seed); the
 *                   even positions leave the union (1 -> 0), the odd ones join (0 -> 1)
 *   stayers         union = 1 in both periods for the stayers with the highest p_i,
 *                   enough of them for an overall union rate of 16.26 percent
 *   log wage        y_it = 3.05 + alpha_i + 0.21 * union_it + 0.073 * t + sigma * e_it
 *   rho < 0 means that low-alpha (lower-wage) workers are more likely to be union
 *   members, the negative selection the post finds.
 *   Estimators: pooled OLS, between, one-way within (FE), two-way within (TWFE),
 *   first differences with and without an intercept, Swamy–Arora random effects.
 *   The chart shows FE (two-way) = FD with an intercept, as in the post.
 *
 * Tab B, "Demeaning lab": a fixed toy panel of 8 workers x 2 periods. Points are
 *   draggable (pointer) and keyboard-adjustable (role="slider") in the raw view
 *   only; the demeaned view is read-only and shows where every observation lands
 *   after subtracting the mean of each worker. POLS and one-way FE re-estimate live.
 *
 * Page-safety contract: this script only writes plain numbers and words into the
 * page (textContent / attributes). It never writes TeX, HTML markup, or a dollar
 * sign, so MathJax and the site code-block scripts never see it.
 *
 * Test hook: window.PanelLab = { estimate, simDraws, buildPanel, toyPanel, ... }.
 */
(function () {
  'use strict';

  var W = typeof window !== 'undefined' ? window : {};
  if (W.PanelLab && W.PanelLab.__loaded) return; // loaded twice: keep the first copy

  /* ------------------------------------------------------------------ */
  /* Constants                                                           */
  /* ------------------------------------------------------------------ */

  var N_WORKERS = 2199;
  var BETA = 0.21;         // true union effect (log points)
  var DELTA = 0.073;       // common period-2 trend
  var SIGMA_A = 0.55;      // sd of the worker effect
  var MU = 3.05;           // wage level
  var UNION_RATE = 0.1626; // overall union rate, as in the post
  var DEFAULTS = { rho: -0.15, share: 3.3, sigma: 0.3 };
  var SEED_BASE = 20100921; // simulated sample #k uses seed SEED_BASE + k (#1 = 20100922, calibrated)
  var DEFAULT_SAMPLE = 1;
  var MINUS = '−';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var Z975 = 1.959963984540054;

  // Toy panel for Tab B. Workers 1-3 never union, 4-5 always union (lower
  // wages: negative selection), 6-7 join the union, 8 leaves it.
  var TOY = {
    group: ['never', 'never', 'never', 'always', 'always', 'join', 'join', 'leave'],
    u1: [0, 0, 0, 1, 1, 0, 0, 1],
    u2: [0, 0, 0, 1, 1, 1, 1, 0],
    y1: [2.45, 3.05, 3.55, 2.80, 3.20, 2.60, 3.20, 3.40],
    y2: [2.65, 2.97, 3.69, 2.90, 3.16, 2.90, 3.42, 3.14],
    jitter: [-0.11, 0.0, 0.11, -0.08, 0.08, -0.05, 0.05, 0.12]
  };
  var TOY_YMIN = 2.2, TOY_YMAX = 4.0;

  /* ------------------------------------------------------------------ */
  /* Random numbers                                                      */
  /* ------------------------------------------------------------------ */

  function mulberry32(seed) {
    var a = seed | 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normalGen(rng) {
    var spare = null;
    return function () {
      if (spare !== null) {
        var s = spare;
        spare = null;
        return s;
      }
      var u = rng();
      while (u <= 1e-300) u = rng();
      var v = rng();
      var r = Math.sqrt(-2 * Math.log(u));
      var th = 2 * Math.PI * v;
      spare = r * Math.sin(th);
      return r * Math.cos(th);
    };
  }

  /* ------------------------------------------------------------------ */
  /* Tab A data                                                          */
  /* ------------------------------------------------------------------ */

  // Structural draws for one seed. Sliders only re-weight these, so moving a
  // slider never redraws the sample.
  function simDraws(n, seed) {
    var rng = mulberry32(seed);
    var z = normalGen(rng);
    var a = new Float64Array(n), v = new Float64Array(n);
    var e1 = new Float64Array(n), e2 = new Float64Array(n), key = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      a[i] = z();
      v[i] = z();
      e1[i] = z();
      e2[i] = z();
      key[i] = rng();
    }
    // switcher order: a random permutation, so the switcher set grows nested with s
    var order = new Array(n);
    for (i = 0; i < n; i++) order[i] = i;
    order.sort(function (p, q) { return key[p] - key[q]; });
    return { n: n, a: a, v: v, e1: e1, e2: e2, order: order, seed: seed };
  }

  // Panel implied by the draws and the slider values.
  // p = { rho, share (percent), sigma }.
  function buildPanel(base, p) {
    var n = base.n, i, j;
    var k = Math.max(0, Math.min(n, Math.round((p.share / 100) * n)));
    var sw = new Uint8Array(n); // 0 stayer, 1 joiner, 2 leaver
    for (j = 0; j < k; j++) sw[base.order[j]] = j % 2 === 0 ? 2 : 1;
    var c = Math.sqrt(Math.max(0, 1 - p.rho * p.rho));
    var prop = new Float64Array(n);
    var stay = [];
    for (i = 0; i < n; i++) {
      prop[i] = p.rho * base.a[i] + c * base.v[i];
      if (!sw[i]) stay.push(i);
    }
    stay.sort(function (x, y) { return prop[y] - prop[x]; });
    var m = Math.max(0, Math.min(stay.length, Math.round(UNION_RATE * n - k / 2)));
    var u1 = new Float64Array(n), u2 = new Float64Array(n);
    for (j = 0; j < m; j++) { u1[stay[j]] = 1; u2[stay[j]] = 1; }
    var joiners = 0, leavers = 0;
    for (i = 0; i < n; i++) {
      if (sw[i] === 1) { u2[i] = 1; joiners++; }
      else if (sw[i] === 2) { u1[i] = 1; leavers++; }
    }
    var y1 = new Float64Array(n), y2 = new Float64Array(n);
    for (i = 0; i < n; i++) {
      var al = MU + SIGMA_A * base.a[i];
      y1[i] = al + BETA * u1[i] + p.sigma * base.e1[i];
      y2[i] = al + BETA * u2[i] + DELTA + p.sigma * base.e2[i];
    }
    return { n: n, u1: u1, u2: u2, y1: y1, y2: y2, switchers: k, joiners: joiners, leavers: leavers,
      always: m, never: n - k - m };
  }

  /* ------------------------------------------------------------------ */
  /* Estimation (pure functions on { n, u1, u2, y1, y2 })                */
  /* ------------------------------------------------------------------ */

  // OLS of y on [1, x] (or on x alone when noInt), classical SE.
  function ols(x, y, noInt) {
    var n = x.length, i, mx = 0, my = 0;
    if (!noInt) {
      for (i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
      mx /= n; my /= n;
    }
    var sxx = 0, sxy = 0;
    for (i = 0; i < n; i++) { sxx += (x[i] - mx) * (x[i] - mx); sxy += (x[i] - mx) * (y[i] - my); }
    var b = sxy / sxx, a = my - b * mx, ssr = 0;
    for (i = 0; i < n; i++) { var r = y[i] - a - b * x[i]; ssr += r * r; }
    var df = n - (noInt ? 1 : 2);
    var s2 = ssr / df;
    return { b: b, a: noInt ? 0 : a, se: Math.sqrt(s2 / sxx), ssr: ssr, s2: s2, sxx: sxx, n: n };
  }

  function stack(P) {
    var n = P.n, x = new Float64Array(2 * n), y = new Float64Array(2 * n);
    for (var i = 0; i < n; i++) { x[i] = P.u1[i]; x[n + i] = P.u2[i]; y[i] = P.y1[i]; y[n + i] = P.y2[i]; }
    return { x: x, y: y };
  }

  function pooled(P) {
    var s = stack(P);
    return ols(s.x, s.y, false);
  }

  function between(P) {
    var n = P.n, x = new Float64Array(n), y = new Float64Array(n);
    for (var i = 0; i < n; i++) { x[i] = (P.u1[i] + P.u2[i]) / 2; y[i] = (P.y1[i] + P.y2[i]) / 2; }
    return ols(x, y, false);
  }

  // Generic within transformation of the stacked panel (T = 2 here, but the
  // demeaning is written out by worker and by period, not via the T = 2 shortcut).
  function demean(P, twoWay) {
    var n = P.n, T = 2, i, t;
    var X = [P.u1, P.u2], Y = [P.y1, P.y2];
    var xi = new Float64Array(n), yi = new Float64Array(n);
    var xt = [0, 0], yt = [0, 0], xa = 0, ya = 0;
    for (i = 0; i < n; i++) {
      for (t = 0; t < T; t++) {
        xi[i] += X[t][i] / T; yi[i] += Y[t][i] / T;
        xt[t] += X[t][i] / n; yt[t] += Y[t][i] / n;
        xa += X[t][i] / (n * T); ya += Y[t][i] / (n * T);
      }
    }
    var xd = new Float64Array(n * T), yd = new Float64Array(n * T);
    for (t = 0; t < T; t++) {
      for (i = 0; i < n; i++) {
        var gx = twoWay ? xt[t] - xa : 0, gy = twoWay ? yt[t] - ya : 0;
        xd[t * n + i] = X[t][i] - xi[i] - gx;
        yd[t * n + i] = Y[t][i] - yi[i] - gy;
      }
    }
    return { x: xd, y: yd, xbar: xi, ybar: yi };
  }

  function withinFit(P, twoWay) {
    var d = demean(P, twoWay);
    var sxx = 0, sxy = 0, i;
    for (i = 0; i < d.x.length; i++) { sxx += d.x[i] * d.x[i]; sxy += d.x[i] * d.y[i]; }
    var b = sxy / sxx, ssr = 0;
    for (i = 0; i < d.x.length; i++) { var r = d.y[i] - b * d.x[i]; ssr += r * r; }
    return { b: b, ssr: ssr, sxx: sxx, xbar: d.xbar, ybar: d.ybar, dx: d.x, dy: d.y };
  }

  function firstDiff(P, noInt) {
    var n = P.n, dx = new Float64Array(n), dy = new Float64Array(n);
    for (var i = 0; i < n; i++) { dx[i] = P.u2[i] - P.u1[i]; dy[i] = P.y2[i] - P.y1[i]; }
    return ols(dx, dy, !!noInt);
  }

  // Swamy–Arora random effects (balanced, T = 2).
  function randomEffects(P, fe, bw) {
    var n = P.n, T = 2, i, t;
    var s2e = fe.ssr / (n * (T - 1) - 1);
    var s2b = bw.ssr / (n - 2);
    var s2u = Math.max(0, s2b - s2e / T);
    var theta = 1 - Math.sqrt(s2e / (s2e + T * s2u));
    var X = [P.u1, P.u2], Y = [P.y1, P.y2];
    // OLS of y* on [c, x*] without a separate intercept: c = 1 - theta, x* = x - theta xbar
    var c = 1 - theta, S11 = 0, S12 = 0, S22 = 0, S1y = 0, S2y = 0;
    for (t = 0; t < T; t++) {
      for (i = 0; i < n; i++) {
        var xs = X[t][i] - theta * fe.xbar[i], ys = Y[t][i] - theta * fe.ybar[i];
        S11 += c * c; S12 += c * xs; S22 += xs * xs; S1y += c * ys; S2y += xs * ys;
      }
    }
    var det = S11 * S22 - S12 * S12;
    var b0 = (S22 * S1y - S12 * S2y) / det;
    var b1 = (S11 * S2y - S12 * S1y) / det;
    var ssr = 0;
    for (t = 0; t < T; t++) {
      for (i = 0; i < n; i++) {
        var r = (Y[t][i] - theta * fe.ybar[i]) - b0 * c - b1 * (X[t][i] - theta * fe.xbar[i]);
        ssr += r * r;
      }
    }
    var s2 = ssr / (n * T - 2);
    return { b: b1, a: b0, se: Math.sqrt((s2 * S11) / det), theta: theta, s2e: s2e, s2u: s2u };
  }

  function estimate(P) {
    var po = pooled(P), bw = between(P);
    var fe = withinFit(P, false), tw = withinFit(P, true);
    var fd = firstDiff(P, false), fd0 = firstDiff(P, true);
    var re = randomEffects(P, fe, bw);
    var feSe = Math.sqrt(fe.ssr / (P.n * (2 - 1) - 1) / fe.sxx);
    return {
      pols: po.b, polsSe: po.se, polsIntercept: po.a,
      between: bw.b, betweenSe: bw.se,
      fe: fe.b, feSe: feSe,
      twfe: tw.b,
      fd: fd.b, fdSe: fd.se, fdIntercept: fd.a,
      fdNoInt: fd0.b,
      re: re.b, reSe: re.se, theta: re.theta,
      feLo: fd.b - Z975 * fd.se, feHi: fd.b + Z975 * fd.se,
      withinX: fe.dx, withinY: fe.dy
    };
  }

  /* ------------------------------------------------------------------ */
  /* Tab B data                                                          */
  /* ------------------------------------------------------------------ */

  function toyPanel(y1, y2) {
    return { n: TOY.u1.length, u1: TOY.u1.slice(), u2: TOY.u2.slice(),
      y1: (y1 || TOY.y1).slice(), y2: (y2 || TOY.y2).slice() };
  }

  // POLS slope and one-way FE slope of the toy panel.
  function toyFit(P) {
    var po = pooled(P), fe = withinFit(P, false);
    return { pols: po.b, polsIntercept: po.a, fe: fe.b, dx: fe.dx, dy: fe.dy };
  }

  function isStayer(i) { return TOY.u1[i] === TOY.u2[i]; }

  /* ------------------------------------------------------------------ */
  /* Formatting, scales and SVG helpers                                  */
  /* ------------------------------------------------------------------ */

  function fmt(v, dp) {
    if (!isFinite(v)) return 'n/a';
    var txt = Math.abs(v).toFixed(dp);
    if (Number(txt) === 0) return (0).toFixed(dp);
    return (v < 0 ? MINUS : '') + txt;
  }

  function fmtInt(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function niceStep(span, target) {
    var raw = span / target;
    var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }

  function niceDomain(lo, hi, target) {
    if (!(hi - lo > 1e-9)) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.04;
    lo -= pad; hi += pad;
    var st = niceStep(hi - lo, target);
    return { lo: Math.floor(lo / st) * st, hi: Math.ceil(hi / st) * st, step: st };
  }

  function symDomain(m, target) {
    if (!(m > 1e-9)) m = 1;
    m *= 1.12;
    var st = niceStep(2 * m, target);
    var M = Math.ceil(m / st) * st;
    return { lo: -M, hi: M, step: st };
  }

  function tickDecimals(step) {
    return step >= 1 ? 0 : Math.max(0, Math.ceil(-Math.log(step) / Math.LN10 - 1e-9));
  }

  function linearScale(dom, r0, r1) {
    var k = (r1 - r0) / (dom.hi - dom.lo);
    var f = function (v) { return r0 + (v - dom.lo) * k; };
    f.invert = function (px) { return dom.lo + (px - r0) / k; };
    return f;
  }

  function f1(v) { return (Math.round(v * 10) / 10).toString(); }

  function svgEl(tag, cls) {
    var e = document.createElementNS(SVGNS, tag);
    if (cls) e.setAttribute('class', cls);
    return e;
  }

  function setText(el, txt) {
    if (el && el.textContent !== txt) el.textContent = txt;
  }

  function setPath(el, d) {
    if (!el) return;
    if (d) { el.removeAttribute('visibility'); el.setAttribute('d', d); }
    else el.setAttribute('visibility', 'hidden');
  }

  function seg(x0, y0, x1, y1) {
    if (!(isFinite(x0) && isFinite(y0) && isFinite(x1) && isFinite(y1))) return '';
    return 'M' + f1(x0) + ' ' + f1(y0) + 'L' + f1(x1) + ' ' + f1(y1);
  }

  // Ticks along one axis of a plot area; reuses a pool of line/text pairs.
  function drawTicks(g, pool, axis, dom, scale, box, labelFn) {
    var k0 = Math.ceil(dom.lo / dom.step - 1e-9), k1 = Math.floor(dom.hi / dom.step + 1e-9);
    var dp = tickDecimals(dom.step);
    var count = 0;
    for (var k = k0; k <= k1; k++) {
      var v = k * dom.step;
      var it = pool[count];
      if (!it) {
        it = { line: svgEl('path', 'pl-gridline'), text: svgEl('text', 'pl-tick') };
        it.text.setAttribute('text-anchor', axis === 'x' ? 'middle' : 'end');
        pool.push(it);
      }
      if (!it.line.parentNode) { g.appendChild(it.line); g.appendChild(it.text); }
      var pos = scale(v);
      if (axis === 'x') {
        it.line.setAttribute('d', seg(pos, box.y0, pos, box.y1));
        it.text.setAttribute('x', f1(pos)); it.text.setAttribute('y', f1(box.y1 + 13));
      } else {
        it.line.setAttribute('d', seg(box.x0, pos, box.x1, pos));
        it.text.setAttribute('x', f1(box.x0 - 5)); it.text.setAttribute('y', f1(pos + 3.5));
      }
      setText(it.text, labelFn ? labelFn(v) : fmt(v, dp));
      count++;
    }
    for (var j = count; j < pool.length; j++) {
      if (pool[j].line.parentNode) { g.removeChild(pool[j].line); g.removeChild(pool[j].text); }
    }
  }

  function clampNum(v, lo, hi, dflt) {
    v = Number(v);
    return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : dflt;
  }


  /* ------------------------------------------------------------------ */
  /* Tab A: the selection lab                                            */
  /* ------------------------------------------------------------------ */

  // Strip chart geometry (viewBox 0 0 320 182).
  var SA = { x0: 104, x1: 308, y0: 20, y1: 150 };
  var ROWS = [
    { key: 'pols', name: 'Pooled OLS', y: 38 },
    { key: 'between', name: 'Between', y: 68 },
    { key: 're', name: 'Random effects', y: 98 },
    { key: 'twfe', name: 'FE (two-way)', y: 128 }
  ];

  function SelectionLab(lab, root) {
    this.lab = lab;
    this.root = root;
    var q = function (s) { return root.querySelector(s); };
    this.inputs = { rho: q('input[data-param="rho"]'), share: q('input[data-param="share"]'),
      sigma: q('input[data-param="sigma"]') };
    this.outputs = { rho: q('output[data-param-out="rho"]'), share: q('output[data-param-out="share"]'),
      sigma: q('output[data-param-out="sigma"]') };
    this.out = {};
    var outs = root.querySelectorAll('[data-out]');
    for (var i = 0; i < outs.length; i++) this.out[outs[i].getAttribute('data-out')] = outs[i];
    this.flag = q('.pl-flag');
    var svg = q('svg[data-strip]');
    this.svg = svg;
    this.desc = svg.querySelector('desc');
    this.gx = svg.querySelector('[data-ticks="x"]');
    this.ticks = [];
    this.truth = svg.querySelector('[data-mk="truth"]');
    this.truthLab = svg.querySelector('[data-mk-label="truth"]');
    this.zero = svg.querySelector('[data-mk="zero"]');
    this.rows = {};
    var self = this;
    ROWS.forEach(function (r) {
      self.rows[r.key] = {
        ci: svg.querySelector('[data-ci="' + r.key + '"]'),
        mk: svg.querySelector('[data-mk="' + r.key + '"]'),
        val: svg.querySelector('[data-val="' + r.key + '"]')
      };
    });
    this.sample = DEFAULT_SAMPLE;
    this.base = null;
    this.baseSeed = null;
    this.bind();
    this.readInputs();
  }

  SelectionLab.prototype.bind = function () {
    var self = this;
    ['rho', 'share', 'sigma'].forEach(function (k) {
      var inp = self.inputs[k];
      inp.addEventListener('input', function () { self.readInputs(); self.lab.schedule(); });
      inp.addEventListener('change', function () { self.lab.announceSoon(); });
    });
    this.root.querySelector('[data-act="draw"]').addEventListener('click', function () {
      self.sample += 1;
      self.readInputs();
      self.lab.schedule();
      self.lab.announceSoon();
    });
    this.root.querySelector('[data-act="reset"]').addEventListener('click', function () {
      self.inputs.rho.value = String(DEFAULTS.rho);
      self.inputs.share.value = String(DEFAULTS.share);
      self.inputs.sigma.value = String(DEFAULTS.sigma);
      self.sample = DEFAULT_SAMPLE;
      self.readInputs();
      self.lab.schedule();
      self.lab.announceSoon();
    });
  };

  SelectionLab.prototype.readInputs = function () {
    var inp = this.inputs;
    this.params = {
      rho: Math.round(clampNum(inp.rho.value, -0.9, 0.9, DEFAULTS.rho) * 100) / 100,
      share: Math.round(clampNum(inp.share.value, 1, 30, DEFAULTS.share) * 10) / 10,
      sigma: Math.round(clampNum(inp.sigma.value, 0.1, 0.6, DEFAULTS.sigma) * 100) / 100
    };
    var seed = SEED_BASE + this.sample;
    if (seed !== this.baseSeed) {
      this.base = simDraws(N_WORKERS, seed);
      this.baseSeed = seed;
    }
  };

  SelectionLab.prototype.isDefault = function () {
    var p = this.params;
    return this.sample === DEFAULT_SAMPLE && p.rho === DEFAULTS.rho && p.share === DEFAULTS.share &&
      p.sigma === DEFAULTS.sigma;
  };

  SelectionLab.prototype.status = function () {
    if (this.isDefault()) return 'Simulated panel calibrated to the post (true effect 0.21)';
    return 'Simulated sample #' + this.sample + ', ' + fmtInt(N_WORKERS) + ' workers, true effect 0.21';
  };

  SelectionLab.prototype.render = function () {
    var p = this.params;
    var P = buildPanel(this.base, p);
    var e = estimate(P);
    this.last = { P: P, e: e };

    setText(this.outputs.rho, fmt(p.rho, 2));
    setText(this.outputs.share, p.share.toFixed(1) + '%');
    setText(this.outputs.sigma, p.sigma.toFixed(2));
    this.inputs.rho.setAttribute('aria-valuetext', fmt(p.rho, 2) +
      (p.rho < 0 ? ', lower-wage workers more likely to be union members' :
        p.rho > 0 ? ', higher-wage workers more likely to be union members' : ', no selection'));
    this.inputs.share.setAttribute('aria-valuetext', p.share.toFixed(1) + ' percent, ' + P.switchers + ' switchers');
    this.inputs.sigma.setAttribute('aria-valuetext', p.sigma.toFixed(2));

    this.drawStrip(e);
    this.drawReadout(P, e, p);
  };

  SelectionLab.prototype.drawStrip = function (e) {
    var cis = {
      pols: [e.pols - Z975 * e.polsSe, e.pols + Z975 * e.polsSe],
      between: [e.between - Z975 * e.betweenSe, e.between + Z975 * e.betweenSe],
      re: [e.re - Z975 * e.reSe, e.re + Z975 * e.reSe],
      twfe: [e.feLo, e.feHi]
    };
    var lo = Math.min(0, BETA), hi = Math.max(0, BETA);
    ROWS.forEach(function (r) {
      var c = cis[r.key];
      if (isFinite(c[0])) lo = Math.min(lo, c[0]);
      if (isFinite(c[1])) hi = Math.max(hi, c[1]);
    });
    if (hi - lo < 0.4) { var mid = (hi + lo) / 2; lo = Math.min(lo, mid - 0.2); hi = Math.max(hi, mid + 0.2); }
    var dom = niceDomain(lo, hi, 5);
    var sx = linearScale(dom, SA.x0, SA.x1);
    drawTicks(this.gx, this.ticks, 'x', dom, sx, SA);
    var xz = sx(0), xt = sx(BETA);
    this.zero.setAttribute('d', seg(xz, SA.y0, xz, SA.y1));
    this.truth.setAttribute('d', seg(xt, SA.y0 - 4, xt, SA.y1));
    this.truthLab.setAttribute('x', f1(Math.min(SA.x1 - 30, Math.max(SA.x0 + 30, xt))));
    var self = this, vals = { pols: e.pols, between: e.between, re: e.re, twfe: e.twfe };
    ROWS.forEach(function (r) {
      var row = self.rows[r.key], v = vals[r.key], c = cis[r.key];
      setPath(row.ci, seg(sx(c[0]), r.y, sx(c[1]), r.y) +
        (isFinite(c[0]) ? 'M' + f1(sx(c[0])) + ' ' + (r.y - 4) + 'L' + f1(sx(c[0])) + ' ' + (r.y + 4) +
          'M' + f1(sx(c[1])) + ' ' + (r.y - 4) + 'L' + f1(sx(c[1])) + ' ' + (r.y + 4) : ''));
      if (isFinite(v)) {
        row.mk.removeAttribute('visibility');
        row.mk.setAttribute('transform', 'translate(' + f1(sx(v)) + ' ' + r.y + ')');
        row.val.removeAttribute('visibility');
        row.val.setAttribute('x', f1(Math.min(SA.x1 - 14, Math.max(SA.x0 + 14, sx(v)))));
        setText(row.val, fmt(v, 3));
      } else {
        row.mk.setAttribute('visibility', 'hidden');
        row.val.setAttribute('visibility', 'hidden');
      }
    });
    setText(this.desc, 'Estimates of the union effect with 95 percent confidence intervals. Pooled OLS ' +
      fmt(e.pols, 3) + ', between ' + fmt(e.between, 3) + ', random effects ' + fmt(e.re, 3) +
      ', FE two-way ' + fmt(e.twfe, 3) + '. The dashed line marks the true effect 0.21.');
  };

  SelectionLab.prototype.flagInfo = function (P, e, p) {
    var gap = e.pols - BETA;
    var covers = e.feLo <= BETA && BETA <= e.feHi;
    var sub = 'FE (two-way) uses only the ' + fmtInt(P.switchers) + ' switchers; its 95% interval, ' +
      fmt(e.feLo, 3) + ' to ' + fmt(e.feHi, 3) + ', ' + (covers ? 'covers' : 'misses') + ' the true effect.';
    if (!isFinite(e.twfe)) {
      return { state: 'na', text: 'No worker switches union status, so FE cannot be estimated.', sub: '' };
    }
    if (Math.abs(p.rho) < 0.005) {
      return { state: 'none', text: 'With no selection, all four estimators center on the true effect; FE is simply noisier.', sub: sub };
    }
    if (Math.abs(gap) > 0.05) {
      return { state: 'bias', text: 'Pooled OLS ' + (gap < 0 ? 'understates' : 'overstates') +
        ' the true effect by ' + fmt(Math.abs(gap), 3) +
        ' log points because union status is correlated with the worker effect.', sub: sub };
    }
    return { state: 'mild', text: 'Selection is mild here, so pooled OLS lands within 0.05 log points of the true effect.', sub: sub };
  };

  SelectionLab.prototype.drawReadout = function (P, e, p) {
    var o = this.out;
    setText(o.pols, fmt(e.pols, 3));
    setText(o.between, fmt(e.between, 3));
    setText(o.re, fmt(e.re, 3));
    setText(o.twfe, fmt(e.twfe, 3));
    setText(o.feci, fmt(e.feLo, 3) + ' to ' + fmt(e.feHi, 3));
    setText(o.switchers, fmtInt(P.switchers) + ' of ' + fmtInt(P.n));
    setText(o.switchSplit, P.joiners + ' join, ' + P.leavers + ' leave; ' + fmtInt(P.always) + ' always union, ' +
      fmtInt(P.never) + ' never union');
    var f = this.flagInfo(P, e, p);
    this.flag.setAttribute('data-state', f.state);
    setText(o.flag, f.text);
    setText(o.flagSub, f.sub);
    this.lastFlag = f;
  };

  SelectionLab.prototype.announcement = function () {
    var L = this.last, p = this.params;
    if (!L) return '';
    var e = L.e;
    return 'Selection lab. Selection ' + fmt(p.rho, 2) + ', ' + L.P.switchers + ' switchers, noise ' +
      p.sigma.toFixed(2) + '. Pooled OLS ' + fmt(e.pols, 3) + ', between ' + fmt(e.between, 3) +
      ', random effects ' + fmt(e.re, 3) + ', FE two-way ' + fmt(e.twfe, 3) + ', true effect 0.21. ' +
      this.lastFlag.text;
  };

  /* ------------------------------------------------------------------ */
  /* Tab B: the demeaning lab                                            */
  /* ------------------------------------------------------------------ */

  // Scatter geometry (viewBox 0 0 300 236).
  var SB = { x0: 46, x1: 290, y0: 12, y1: 192 };
  var GROUP_NAME = { never: 'never union', always: 'always union', join: 'joins the union', leave: 'leaves the union' };

  function DemeanLab(lab, root) {
    this.lab = lab;
    this.root = root;
    var q = function (s) { return root.querySelector(s); };
    this.out = {};
    var outs = root.querySelectorAll('[data-out]');
    for (var i = 0; i < outs.length; i++) this.out[outs[i].getAttribute('data-out')] = outs[i];
    this.flag = q('.pl-flag');
    this.svg = q('svg[data-scatter]');
    this.desc = this.svg.querySelector('desc');
    this.gx = this.svg.querySelector('[data-ticks="x"]');
    this.gy = this.svg.querySelector('[data-ticks="y"]');
    this.tx = [];
    this.ty = [];
    this.gLinks = this.svg.querySelector('[data-links]');
    this.gPts = this.svg.querySelector('[data-pts]');
    this.linePols = this.svg.querySelectorAll('[data-line="pols"]');
    this.lineFe = this.svg.querySelectorAll('[data-line="fe"]');
    this.axisZero = this.svg.querySelector('[data-zero="x"]');
    this.axisZeroLab = this.svg.querySelector('[data-zero-label]');
    this.xlab = this.svg.querySelector('[data-axlab="x"]');
    this.ylab = this.svg.querySelector('[data-axlab="y"]');
    this.views = root.querySelectorAll('[data-view]');
    this.viewNote = q('[data-out="viewNote"]');
    this.mode = 'raw';
    this.y1 = TOY.y1.slice();
    this.y2 = TOY.y2.slice();
    this.moved = null; // index of the last worker moved by the reader
    this.drag = null;
    this.build();
    this.bind();
  }

  DemeanLab.prototype.build = function () {
    var n = TOY.u1.length, i, t;
    this.links = [];
    this.pts = [];
    for (i = 0; i < n; i++) {
      var g = TOY.group[i], sw = g === 'join' || g === 'leave';
      var link = svgEl('path', 'pl-link pl-g-' + (sw ? 'switch' : g));
      this.gLinks.appendChild(link);
      this.links.push(link);
    }
    for (t = 0; t < 2; t++) {
      for (i = 0; i < n; i++) {
        var grp = TOY.group[i], isSw = grp === 'join' || grp === 'leave';
        var cls = 'pl-pt pl-g-' + (isSw ? 'switch' : grp) + ' pl-p' + (t + 1);
        var el = svgEl('g', cls);
        var hit = svgEl('circle', 'pl-hit');
        hit.setAttribute('r', '12');
        var ring = svgEl('circle', 'pl-ring');
        ring.setAttribute('r', '9');
        var mk;
        if (grp === 'never') { mk = svgEl('circle', 'pl-mark'); mk.setAttribute('r', '4.6'); }
        else if (grp === 'always') { mk = svgEl('rect', 'pl-mark'); mk.setAttribute('x', '-4.2'); mk.setAttribute('y', '-4.2'); mk.setAttribute('width', '8.4'); mk.setAttribute('height', '8.4'); }
        else { mk = svgEl('path', 'pl-mark'); mk.setAttribute('d', 'M0 -5.8L5.8 0L0 5.8L-5.8 0Z'); }
        el.appendChild(hit);
        el.appendChild(ring);
        el.appendChild(mk);
        el.setAttribute('role', 'slider');
        el.setAttribute('aria-orientation', 'vertical');
        el.setAttribute('aria-label', 'Worker ' + (i + 1) + ', ' + GROUP_NAME[grp] + ', period ' + (t + 1) + ', log wage');
        el.setAttribute('aria-valuemin', TOY_YMIN.toFixed(2));
        el.setAttribute('aria-valuemax', TOY_YMAX.toFixed(2));
        el._i = i;
        el._t = t;
        this.gPts.appendChild(el);
        this.pts.push(el);
      }
    }
  };

  DemeanLab.prototype.bind = function () {
    var self = this;
    for (var v = 0; v < this.views.length; v++) {
      this.views[v].addEventListener('click', function (ev) {
        self.setMode(ev.currentTarget.getAttribute('data-view'));
      });
    }
    this.root.querySelector('[data-act="reset-points"]').addEventListener('click', function () {
      self.y1 = TOY.y1.slice();
      self.y2 = TOY.y2.slice();
      self.moved = null;
      self.lab.schedule();
      self.lab.announceSoon();
    });
    this.pts.forEach(function (el) {
      el.addEventListener('keydown', function (ev) { self.onKey(ev, el); });
      el.addEventListener('pointerdown', function (ev) { self.onDown(ev, el); });
      el.addEventListener('pointermove', function (ev) { self.onMove(ev, el); });
      el.addEventListener('pointerup', function (ev) { self.onUp(ev, el); });
      el.addEventListener('pointercancel', function (ev) { self.onUp(ev, el); });
    });
  };

  DemeanLab.prototype.setMode = function (m) {
    if (m !== 'raw' && m !== 'demeaned') return;
    this.mode = m;
    for (var v = 0; v < this.views.length; v++) {
      this.views[v].setAttribute('aria-pressed', this.views[v].getAttribute('data-view') === m ? 'true' : 'false');
    }
    this.svg.setAttribute('data-mode', m);
    this.lab.schedule();
    this.lab.announceSoon();
  };

  DemeanLab.prototype.getY = function (i, t) { return t === 0 ? this.y1[i] : this.y2[i]; };

  DemeanLab.prototype.setY = function (i, t, v) {
    v = Math.round(clampNum(v, TOY_YMIN, TOY_YMAX, this.getY(i, t)) * 100) / 100;
    if (t === 0) this.y1[i] = v; else this.y2[i] = v;
    this.moved = i;
    this.lab.schedule();
  };

  DemeanLab.prototype.onKey = function (ev, el) {
    if (this.mode !== 'raw') return;
    var i = el._i, t = el._t, y = this.getY(i, t), nv = null;
    switch (ev.key) {
      case 'ArrowUp': case 'ArrowRight': nv = y + 0.05; break;
      case 'ArrowDown': case 'ArrowLeft': nv = y - 0.05; break;
      case 'PageUp': nv = y + 0.25; break;
      case 'PageDown': nv = y - 0.25; break;
      case 'Home': nv = TOY_YMIN; break;
      case 'End': nv = TOY_YMAX; break;
      default: return;
    }
    ev.preventDefault();
    this.setY(i, t, nv);
    this.lab.announceSoon();
  };

  DemeanLab.prototype.svgY = function (ev) {
    var ctm = this.svg.getScreenCTM();
    if (!ctm) return NaN;
    var pt = this.svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    return pt.matrixTransform(ctm.inverse()).y;
  };

  DemeanLab.prototype.onDown = function (ev, el) {
    if (this.mode !== 'raw' || (ev.button !== undefined && ev.button !== 0)) return;
    ev.preventDefault();
    try { el.setPointerCapture(ev.pointerId); } catch (err) { /* older browsers */ }
    if (el.focus) { try { el.focus({ preventScroll: true }); } catch (err2) { el.focus(); } }
    this.drag = { el: el, id: ev.pointerId };
    el.setAttribute('data-dragging', '');
    this.onMove(ev, el);
  };

  DemeanLab.prototype.onMove = function (ev, el) {
    if (!this.drag || this.drag.el !== el || this.drag.id !== ev.pointerId) return;
    var y = this.svgY(ev);
    if (!isFinite(y) || !this.sy) return;
    this.setY(el._i, el._t, this.sy.invert(y));
  };

  DemeanLab.prototype.onUp = function (ev, el) {
    if (!this.drag || this.drag.el !== el) return;
    this.drag = null;
    el.removeAttribute('data-dragging');
    try { el.releasePointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
    this.lab.announceSoon();
  };

  DemeanLab.prototype.render = function () {
    var P = toyPanel(this.y1, this.y2);
    var f = toyFit(P);
    this.last = f;
    var raw = this.mode === 'raw', n = P.n, i, t;
    var dx, dy, sx, sy;
    if (raw) {
      dx = { lo: -0.35, hi: 1.35, step: 1 };
      dy = { lo: TOY_YMIN, hi: TOY_YMAX, step: 0.5 };
    } else {
      var m = 0;
      for (i = 0; i < f.dy.length; i++) m = Math.max(m, Math.abs(f.dy[i]));
      dx = { lo: -0.8, hi: 0.8, step: 0.5 };
      dy = symDomain(Math.max(m, 0.1), 4);
    }
    sx = linearScale(dx, SB.x0, SB.x1);
    sy = linearScale(dy, SB.y1, SB.y0);
    this.sy = raw ? sy : null;
    drawTicks(this.gx, this.tx, 'x', dx, sx, SB, raw ? function (v) { return v === 0 ? '0 (non-union)' : '1 (union)'; } : null);
    drawTicks(this.gy, this.ty, 'y', dy, sy, SB);

    var X = [P.u1, P.u2], Y = [P.y1, P.y2];
    var pos = [[], []];
    for (t = 0; t < 2; t++) {
      for (i = 0; i < n; i++) {
        var xv, yv;
        if (raw) { xv = X[t][i] + TOY.jitter[i] + (t === 0 ? -0.035 : 0.035); yv = Y[t][i]; }
        else { xv = f.dx[t * n + i]; yv = f.dy[t * n + i]; }
        pos[t][i] = [sx(xv), sy(yv)];
      }
    }
    for (i = 0; i < n; i++) {
      this.links[i].setAttribute('d', seg(pos[0][i][0], pos[0][i][1], pos[1][i][0], pos[1][i][1]));
    }
    for (var k = 0; k < this.pts.length; k++) {
      var el = this.pts[k], pi = el._i, pt = el._t;
      el.setAttribute('transform', 'translate(' + f1(pos[pt][pi][0]) + ' ' + f1(pos[pt][pi][1]) + ')');
      var yval = Y[pt][pi];
      el.setAttribute('aria-valuenow', yval.toFixed(2));
      if (raw) {
        el.setAttribute('tabindex', '0');
        el.removeAttribute('aria-disabled');
        el.setAttribute('aria-valuetext', yval.toFixed(2));
      } else {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('aria-valuetext', yval.toFixed(2) + ', demeaned ' + fmt(f.dy[pt * n + pi], 3));
      }
    }

    // fitted lines
    var lp = raw ? seg(sx(dx.lo), sy(f.polsIntercept + f.pols * dx.lo), sx(dx.hi), sy(f.polsIntercept + f.pols * dx.hi)) : '';
    var lf = raw ? '' : seg(sx(dx.lo), sy(f.fe * dx.lo), sx(dx.hi), sy(f.fe * dx.hi));
    for (i = 0; i < this.linePols.length; i++) setPath(this.linePols[i], lp);
    for (i = 0; i < this.lineFe.length; i++) setPath(this.lineFe[i], lf);
    setPath(this.axisZero, raw ? '' : seg(sx(0), SB.y0, sx(0), SB.y1));
    if (raw) this.axisZeroLab.setAttribute('visibility', 'hidden');
    else { this.axisZeroLab.removeAttribute('visibility'); this.axisZeroLab.setAttribute('x', f1(sx(0) + 5)); }
    setText(this.xlab, raw ? 'Union status' : 'Demeaned union status');
    setText(this.ylab, raw ? 'Log wage' : 'Demeaned log wage');
    setText(this.desc, raw
      ? 'Raw toy panel: 8 workers, two periods each, log wage against union status. Pooled OLS line with slope ' + fmt(f.pols, 3) + '.'
      : 'Demeaned toy panel: the 5 stayers sit on the vertical axis at zero; only the 3 switchers lie off it. FE line through the origin with slope ' + fmt(f.fe, 3) + '.');
    this.drawReadout(f);
  };

  DemeanLab.prototype.note = function () {
    if (this.moved === null) return { state: 'default', text: 'Only the 3 switchers move off the vertical axis after demeaning; they alone determine the FE slope.' };
    if (isStayer(this.moved)) return { state: 'stayer', text: 'Moving a stayer changes POLS but leaves FE unchanged.' };
    return { state: 'switcher', text: 'Moving a switcher changes both POLS and FE, because FE is identified by the switchers alone.' };
  };

  DemeanLab.prototype.drawReadout = function (f) {
    var o = this.out;
    setText(o.toyPols, fmt(f.pols, 3));
    setText(o.toyFe, fmt(f.fe, 3));
    setText(o.toyGap, fmt(f.fe - f.pols, 3));
    var nt = this.note();
    this.flag.setAttribute('data-state', nt.state);
    setText(o.toyFlag, nt.text);
    setText(this.viewNote, this.mode === 'raw'
      ? 'Drag a point up or down, or focus it and use the arrow keys (Page Up and Page Down for larger steps).'
      : 'Demeaned view: read only. Switch to the raw data to move points.');
    this.lastNote = nt;
  };

  DemeanLab.prototype.announcement = function () {
    var f = this.last;
    if (!f) return '';
    var head = this.mode === 'raw' ? 'Demeaning lab, raw data. ' : 'Demeaning lab, demeaned data. ';
    var who = '';
    if (this.moved !== null) {
      who = 'Worker ' + (this.moved + 1) + ', ' + (isStayer(this.moved) ? 'a stayer' : 'a switcher') + '. ';
    }
    return head + who + 'POLS slope ' + fmt(f.pols, 3) + ', FE slope ' + fmt(f.fe, 3) + '. ' + this.lastNote.text;
  };

  /* ------------------------------------------------------------------ */
  /* The widget: tabs, scheduling, announcements                         */
  /* ------------------------------------------------------------------ */

  function Lab(el) {
    this.el = el;
    this.frame = 0;
    this.announceTimer = 0;
    this.live = el.querySelector('[data-live]');
    this.status = el.querySelector('[data-out="status"]');
    this.tabs = Array.prototype.slice.call(el.querySelectorAll('[role="tab"]'));
    this.panels = {};
    var ps = el.querySelectorAll('[role="tabpanel"]');
    for (var i = 0; i < ps.length; i++) this.panels[ps[i].getAttribute('data-panel')] = ps[i];
    this.sel = new SelectionLab(this, this.panels.selection);
    this.dem = new DemeanLab(this, this.panels.demeaning);
    this.bindTabs();
    var start = el.getAttribute('data-tab') === 'demeaning' ? 'demeaning' : 'selection';
    this.select(start, false);
    this.render();
    el.setAttribute('data-ready', '');
  }

  Lab.prototype.bindTabs = function () {
    var self = this;
    this.tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () { self.select(tab.getAttribute('data-tab'), true); });
      tab.addEventListener('keydown', function (ev) {
        var n = self.tabs.length, j = null;
        if (ev.key === 'ArrowRight') j = (idx + 1) % n;
        else if (ev.key === 'ArrowLeft') j = (idx - 1 + n) % n;
        else if (ev.key === 'Home') j = 0;
        else if (ev.key === 'End') j = n - 1;
        if (j === null) return;
        ev.preventDefault();
        self.select(self.tabs[j].getAttribute('data-tab'), true);
        self.tabs[j].focus();
      });
    });
  };

  Lab.prototype.select = function (name, announce) {
    this.active = name;
    var self = this;
    this.tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
    Object.keys(this.panels).forEach(function (k) {
      if (k === name) self.panels[k].removeAttribute('hidden');
      else self.panels[k].setAttribute('hidden', '');
    });
    this.el.setAttribute('data-active', name);
    this.updateStatus();
    if (announce) this.announceSoon();
  };

  Lab.prototype.updateStatus = function () {
    setText(this.status, this.active === 'demeaning'
      ? 'Toy panel: 8 workers observed in 2 periods'
      : this.sel.status());
  };

  Lab.prototype.schedule = function () {
    var self = this;
    if (this.frame) return;
    var raf = W.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
    this.frame = raf(function () { self.frame = 0; self.render(); });
  };

  Lab.prototype.render = function () {
    this.sel.render();
    this.dem.render();
    this.updateStatus();
  };

  Lab.prototype.announceSoon = function () {
    var self = this;
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(function () {
      if (!self.live) return;
      if (self.frame) { self.announceSoon(); return; } // wait for the pending render
      self.live.textContent = self.active === 'demeaning' ? self.dem.announcement() : self.sel.announcement();
    }, 400);
  };

  function initAll() {
    var els = document.querySelectorAll('.panel-lab[data-panel-lab]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].hasAttribute('data-ready') || els[i]._panelLab) continue;
      try {
        els[i]._panelLab = new Lab(els[i]);
      } catch (e) {
        if (W.console) W.console.error('panel-lab: could not start', els[i].id, e);
      }
    }
  }

  W.PanelLab = {
    __loaded: true,
    mulberry32: mulberry32,
    normalGen: normalGen,
    simDraws: simDraws,
    buildPanel: buildPanel,
    estimate: estimate,
    ols: ols,
    pooled: pooled,
    between: between,
    withinFit: withinFit,
    firstDiff: firstDiff,
    randomEffects: randomEffects,
    toyPanel: toyPanel,
    toyFit: toyFit,
    TOY: TOY,
    DEFAULTS: DEFAULTS,
    SEED_BASE: SEED_BASE,
    DEFAULT_SAMPLE: DEFAULT_SAMPLE,
    N_WORKERS: N_WORKERS,
    BETA: BETA,
    init: initAll
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();
  }
})();
