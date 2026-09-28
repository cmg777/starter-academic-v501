/*!
 * fwl-lab.js — inline interactive Frisch–Waugh–Lovell (FWL) lab.
 *
 * Loaded once per page by layouts/shortcodes/fwl-lab.html through Hugo Pipes
 * (js.Build, target es2017, minified, fingerprinted). No dependencies.
 * Initializes every `.fwl-lab[data-fwl-lab]` element on the page.
 *
 * Data-generating process (the defaults reproduce content/post/python_fwl):
 *   income     I ~ N(50, 10)
 *   dayofweek  D ~ U{1, ..., 7}
 *   coupons    C = 60 + pi * I + eC,                            eC ~ N(0, 5)
 *   sales      S = 10 + beta1 * C + beta2 * I + 0.5 * D + eS,   eS ~ N(0, 3)
 *   post values: pi = -0.5, beta2 = 0.3, beta1 = 0.2
 *
 * Large-sample (plim) naive slope of S on C:
 *   beta1 + beta2 * Cov(C, I) / Var(C) = beta1 + beta2 * 100 pi / (100 pi^2 + 25)
 *
 * Page-safety contract: this script only ever writes plain numbers and words
 * into the page (textContent / attributes). It never writes TeX, HTML markup,
 * or a dollar sign, so MathJax and the site's code-block scripts never see it.
 *
 * Test hook: window.FWLLab = { summarize, buildData, postDraws, simDraws, ... }.
 */
(function () {
  'use strict';

  var W = typeof window !== 'undefined' ? window : {};
  if (W.FWLLab && W.FWLLab.__loaded) return; // loaded twice: keep the first copy

  var DEFAULTS = { pi: -0.5, beta2: 0.3, beta1: 0.2 };
  var N_STEPS = [20, 50, 100, 200, 500, 1000];
  var DEFAULT_N_INDEX = 1; // 50 stores
  var SEED_BASE = 20260314; // simulated sample #k uses seed SEED_BASE + k
  var MINUS = '−';
  var SVGNS = 'http://www.w3.org/2000/svg';

  // The post's 50 stores, copied row for row from
  // content/post/python_fwl/data/fwl_store_data.csv (written by
  // content/post/python_fwl/script.py, seed 42; columns sales, coupons, income, dayofweek -> dow).
  // Do not edit by hand. If the CSV changes, run this from the repo root and
  // paste its four printed lines over the four arrays below:
  //   node -e "const r=require('fs').readFileSync('content/post/python_fwl/data/fwl_store_data.csv','utf8').trim().split('\n').slice(1).map(l=>l.split(',').map(Number));console.log(['sales','coupons','income','dow'].map((k,j)=>'    '+k+': ['+r.map(x=>x[j])+']').join(',\n'))"
  var POST_STORES = {
    sales: [37.37,36.88,33.09,35.09,27.01,31.18,28.46,35.91,32.92,26.69,33.2,36.03,35.16,41.23,43.12,32.69,31.67,25.76,36.98,29.77,31.94,29.48,33.53,38.29,33.21,32.94,33.26,29.35,32.6,33.77,44.38,32.13,36.08,30.21,29.45,33.8,33.33,37.11,27.44,37.39,33.75,39.11,32.35,34.6,34.87,29.95,38.26,32.3,34.54,30.64],
    coupons: [36.93,38.06,32.04,33.43,43.21,43.79,31.05,34.77,33.18,33.29,33.04,28.76,34.73,31.77,34.9,42.62,32.66,37.68,30.21,26.81,28.69,31.79,23.9,37.77,32.61,34.87,38.83,31.39,36.62,28.18,23.26,32.28,35.87,43.27,23.28,31.53,36.76,36.23,31.89,32.11,28.64,33.45,38.44,41.85,33.22,28.79,31.54,34.98,38.4,38.84],
    income: [53.05,39.6,57.5,59.41,30.49,36.98,51.28,46.84,49.83,41.47,58.79,57.78,50.66,61.27,54.68,41.41,53.69,40.41,58.78,49.5,48.15,43.19,62.23,48.45,45.72,46.48,55.32,53.65,54.13,54.31,71.42,45.94,44.88,41.86,56.16,61.29,48.86,41.6,41.76,56.51,57.43,55.43,43.34,52.32,51.17,52.19,58.71,52.24,56.79,50.68],
    dow: [6,6,6,5,4,5,2,6,4,4,4,4,1,1,2,1,4,5,5,4,6,4,1,6,5,5,4,4,1,4,6,3,5,1,3,4,7,2,2,3,7,6,1,2,6,1,6,2,7,3]
  };

  /* ------------------------------------------------------------------ */
  /* Random numbers                                                      */
  /* ------------------------------------------------------------------ */

  // Small, fast, seedable PRNG returning uniforms on [0, 1).
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

  // Standard normal draws via Box–Muller (the second draw of each pair is cached).
  function normalGen(rng) {
    var spare = null;
    return function () {
      if (spare !== null) {
        var s = spare;
        spare = null;
        return s;
      }
      var u = rng();
      while (u <= 1e-300) u = rng(); // guard log(0)
      var v = rng();
      var r = Math.sqrt(-2 * Math.log(u));
      var th = 2 * Math.PI * v;
      spare = r * Math.sin(th);
      return r * Math.cos(th);
    };
  }

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  // The post's 50 stores, expressed as structural draws (income, day, errors),
  // so any (pi, beta1, beta2) can be rebuilt on exactly the same stores.
  function postDraws() {
    var P = POST_STORES;
    var n = P.income.length;
    var I = new Float64Array(n), D = new Float64Array(n);
    var eC = new Float64Array(n), eS = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      I[i] = P.income[i];
      D[i] = P.dow[i];
      eC[i] = P.coupons[i] - (60 - 0.5 * P.income[i]);
      eS[i] = P.sales[i] - (10 + 0.2 * P.coupons[i] + 0.3 * P.income[i] + 0.5 * P.dow[i]);
    }
    return { n: n, I: I, dow: D, eC: eC, eS: eS, source: 'post' };
  }

  // Fresh structural draws. Rows are generated in order, so a larger n with
  // the same seed extends a smaller sample instead of replacing it.
  function simDraws(n, seed) {
    var rng = mulberry32(seed);
    var z = normalGen(rng);
    var I = new Float64Array(n), D = new Float64Array(n);
    var eC = new Float64Array(n), eS = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      I[i] = 50 + 10 * z();
      D[i] = 1 + Math.floor(rng() * 7);
      eC[i] = 5 * z();
      eS[i] = 3 * z();
    }
    return { n: n, I: I, dow: D, eC: eC, eS: eS, source: 'sim', seed: seed };
  }

  // Coupons and sales implied by the structural draws and the slider values.
  function buildData(base, p) {
    var n = base.n;
    var c = new Float64Array(n), s = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      c[i] = 60 + p.pi * base.I[i] + base.eC[i];
      s[i] = 10 + p.beta1 * c[i] + p.beta2 * base.I[i] + 0.5 * base.dow[i] + base.eS[i];
    }
    return { n: n, c: c, s: s, I: base.I, dow: base.dow };
  }

  function plimNaive(p) {
    return p.beta1 + (p.beta2 * 100 * p.pi) / (100 * p.pi * p.pi + 25);
  }

  /* ------------------------------------------------------------------ */
  /* Estimation                                                          */
  /* ------------------------------------------------------------------ */

  // Naive slope, FWL slope, full-regression income coefficient, auxiliary
  // slope, the in-sample omitted-variable gap gamma * delta (= naive - FWL,
  // exactly), and the large-sample naive slope.
  // All regressions use centered sums (closed-form OLS with an intercept).
  function summarize(d, p) {
    var n = d.n, c = d.c, s = d.s, I = d.I, i;
    var mc = 0, ms = 0, mI = 0;
    for (i = 0; i < n; i++) { mc += c[i]; ms += s[i]; mI += I[i]; }
    mc /= n; ms /= n; mI /= n;

    var Scc = 0, Scs = 0, ScI = 0, SII = 0, SIs = 0;
    for (i = 0; i < n; i++) {
      var dc = c[i] - mc, ds = s[i] - ms, dI = I[i] - mI;
      Scc += dc * dc; Scs += dc * ds; ScI += dc * dI; SII += dI * dI; SIs += dI * ds;
    }

    var naive = Scs / Scc;              // sales ~ 1 + coupons
    var delta = ScI / Scc;              // income ~ 1 + coupons
    var det = Scc * SII - ScI * ScI;
    var gamma = (Scc * SIs - ScI * Scs) / det; // income coef in sales ~ 1 + coupons + income

    // FWL: residualize coupons and sales on [1, income], then regress
    // residual on residual (no intercept needed: both residuals have mean 0).
    var bcI = ScI / SII, bsI = SIs / SII;
    var cT = new Float64Array(n), sT = new Float64Array(n);
    var Stt = 0, Sts = 0;
    for (i = 0; i < n; i++) {
      var di = I[i] - mI;
      var ct = (c[i] - mc) - bcI * di;
      var st = (s[i] - ms) - bsI * di;
      cT[i] = ct; sT[i] = st;
      Stt += ct * ct; Sts += ct * st;
    }
    var fwl = Sts / Stt;
    var ovb = gamma * delta;

    return {
      n: n,
      naive: naive,
      fwl: fwl,
      gamma: gamma,
      delta: delta,
      ovb: ovb,
      plim: p ? plimNaive(p) : NaN,
      identityErr: naive - fwl - ovb,
      naiveIntercept: ms - naive * mc,
      meanC: mc,
      meanS: ms,
      cTilde: cT,
      sTilde: sT
    };
  }

  // Income third (0 = low, 1 = middle, 2 = high) of each store in the sample.
  function terciles(I) {
    var n = I.length;
    var sorted = Array.prototype.slice.call(I).sort(function (a, b) { return a - b; });
    var q1 = sorted[Math.floor(n / 3)], q2 = sorted[Math.floor((2 * n) / 3)];
    var t = new Uint8Array(n);
    for (var i = 0; i < n; i++) t[i] = I[i] < q1 ? 0 : I[i] < q2 ? 1 : 2;
    return t;
  }

  /* ------------------------------------------------------------------ */
  /* Formatting and scales                                               */
  /* ------------------------------------------------------------------ */

  function round2(v) { return Math.round(v * 100) / 100; }

  function fmt(v, dp) {
    if (!isFinite(v)) return '—';
    var a = Math.abs(v);
    var txt = a.toFixed(dp);
    if (Number(txt) === 0) return (0).toFixed(dp);
    return (v < 0 ? MINUS : '') + txt;
  }

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
    m *= 1.06;
    var st = niceStep(2 * m, target);
    var M = Math.ceil(m / st) * st;
    return { lo: -M, hi: M, step: st };
  }

  function extent(a) {
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i < a.length; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i]; }
    return [lo, hi];
  }

  function maxAbs(a) {
    var m = 0;
    for (var i = 0; i < a.length; i++) { var v = Math.abs(a[i]); if (v > m) m = v; }
    return m;
  }

  function tickDecimals(step) {
    return step >= 1 ? 0 : Math.max(0, Math.ceil(-Math.log(step) / Math.LN10 - 1e-9));
  }

  function radiusFor(n) {
    return n <= 20 ? 3.6 : n <= 50 ? 3.2 : n <= 100 ? 2.8 : n <= 200 ? 2.3 : n <= 500 ? 1.7 : 1.3;
  }

  function densityFor(n) { return n <= 100 ? 'lo' : n <= 200 ? 'mid' : 'hi'; }

  // Plot area inside the 300 x 220 viewBox (matches the clip rects in the shortcode).
  var PX0 = 40, PX1 = 290, PY0 = 10, PY1 = 184;
  // Slope strip: [-1.5, 1.5] mapped onto x in [20, 280] of a 300 x 56 viewBox.
  var SX0 = 20, SX1 = 280, SLO = -1.5, SHI = 1.5;

  function svgEl(tag, cls) {
    var e = document.createElementNS(SVGNS, tag);
    if (cls) e.setAttribute('class', cls);
    return e;
  }

  function setText(el, txt) {
    if (el && el.textContent !== txt) el.textContent = txt;
  }

  function f1(v) { return (Math.round(v * 10) / 10).toString(); }

  /* ------------------------------------------------------------------ */
  /* Plot helpers                                                        */
  /* ------------------------------------------------------------------ */

  function makePlot(svg) {
    var lines = {};
    var ls = svg.querySelectorAll('[data-line]');
    for (var i = 0; i < ls.length; i++) {
      var k = ls[i].getAttribute('data-line');
      (lines[k] = lines[k] || []).push(ls[i]);
    }
    return {
      svg: svg,
      pts: svg.querySelector('[data-pts]'),
      gx: svg.querySelector('[data-ticks="x"]'),
      gy: svg.querySelector('[data-ticks="y"]'),
      desc: svg.querySelector('desc'),
      lines: lines,
      pool: [],
      attached: 0,
      r: 0,
      tx: [],
      ty: []
    };
  }

  function drawTicks(plot, axis, dom, scale) {
    var g = axis === 'x' ? plot.gx : plot.gy;
    var items = axis === 'x' ? plot.tx : plot.ty;
    var k0 = Math.ceil(dom.lo / dom.step - 1e-9), k1 = Math.floor(dom.hi / dom.step + 1e-9);
    var dp = tickDecimals(dom.step);
    var count = 0;
    for (var k = k0; k <= k1; k++) {
      var v = k * dom.step;
      var it = items[count];
      if (!it) {
        it = { line: svgEl('line', 'fl-gridline'), text: svgEl('text', 'fl-tick') };
        it.text.setAttribute('text-anchor', axis === 'x' ? 'middle' : 'end');
        items.push(it);
      }
      if (!it.line.parentNode) { g.appendChild(it.line); g.appendChild(it.text); }
      var pos = f1(scale(v));
      if (axis === 'x') {
        it.line.setAttribute('x1', pos); it.line.setAttribute('x2', pos);
        it.line.setAttribute('y1', PY0); it.line.setAttribute('y2', PY1);
        it.text.setAttribute('x', pos); it.text.setAttribute('y', PY1 + 13);
      } else {
        it.line.setAttribute('y1', pos); it.line.setAttribute('y2', pos);
        it.line.setAttribute('x1', PX0); it.line.setAttribute('x2', PX1);
        it.text.setAttribute('x', PX0 - 5); it.text.setAttribute('y', f1(scale(v) + 3.5));
      }
      setText(it.text, fmt(v, dp));
      count++;
    }
    for (var j = count; j < items.length; j++) {
      if (items[j].line.parentNode) { g.removeChild(items[j].line); g.removeChild(items[j].text); }
    }
  }

  function drawPoints(plot, xs, ys, terc, n, sx, sy) {
    var pool = plot.pool, g = plot.pts, i, c;
    var r = radiusFor(n);
    while (pool.length < n) {
      c = svgEl('circle', 'fl-pt');
      c._t = -1;
      pool.push(c);
    }
    var frag = null;
    for (i = 0; i < n; i++) {
      c = pool[i];
      c.setAttribute('cx', f1(sx(xs[i])));
      c.setAttribute('cy', f1(sy(ys[i])));
      if (c._t !== terc[i]) { c.setAttribute('class', 'fl-pt fl-t' + terc[i]); c._t = terc[i]; }
      if (plot.r !== r || i >= plot.attached) c.setAttribute('r', r);
      if (i >= plot.attached) { frag = frag || document.createDocumentFragment(); frag.appendChild(c); }
    }
    if (frag) g.appendChild(frag);
    for (i = n; i < plot.attached; i++) g.removeChild(pool[i]);
    plot.attached = n;
    plot.r = r;
    plot.svg.setAttribute('data-density', densityFor(n));
  }

  // Lines are <path> elements (the HTML minifier may rewrite static <line>s).
  function setLine(plot, key, x0, y0, x1, y1) {
    var els = plot.lines[key];
    if (!els) return;
    var ok = isFinite(x0) && isFinite(y0) && isFinite(x1) && isFinite(y1);
    var d = ok ? 'M' + f1(x0) + ' ' + f1(y0) + 'L' + f1(x1) + ' ' + f1(y1) : '';
    for (var i = 0; i < els.length; i++) {
      if (ok) {
        els[i].removeAttribute('visibility');
        els[i].setAttribute('d', d);
      } else {
        els[i].setAttribute('visibility', 'hidden');
      }
    }
  }

  function linearScale(dom, r0, r1) {
    var k = (r1 - r0) / (dom.hi - dom.lo);
    return function (v) { return r0 + (v - dom.lo) * k; };
  }

  // Keep the y coordinates of a line inside a generous band so huge values
  // never reach the DOM (the clip path trims the visible part).
  function lineAcross(domX, sx, sy, a, b) {
    var x0 = domX.lo, x1 = domX.hi;
    var Y0 = sy(a + b * x0), Y1 = sy(a + b * x1);
    var X0 = sx(x0), X1 = sx(x1);
    var LIM = 5000;
    if (Math.abs(Y0) > LIM || Math.abs(Y1) > LIM) {
      // shorten the segment symmetrically toward the plot center
      var t = (LIM - 1) / Math.max(Math.abs(Y0), Math.abs(Y1));
      var xm = (X0 + X1) / 2, ym = (Y0 + Y1) / 2;
      X0 = xm + (X0 - xm) * t; X1 = xm + (X1 - xm) * t;
      Y0 = ym + (Y0 - ym) * t; Y1 = ym + (Y1 - ym) * t;
    }
    return [X0, Y0, X1, Y1];
  }

  /* ------------------------------------------------------------------ */
  /* The lab                                                             */
  /* ------------------------------------------------------------------ */

  function Lab(el) {
    this.el = el;
    this.preset = el.getAttribute('data-preset') === 'none' ? 'none' : 'post';
    this.sample = this.preset === 'post' ? 0 : 1; // 0 = the post's stores
    this.base = null;
    this.baseKey = '';
    this.terc = null;
    this.frame = 0;
    this.announceTimer = 0;

    var q = function (sel) { return el.querySelector(sel); };
    this.inputs = { pi: q('input[data-param="pi"]'), beta2: q('input[data-param="beta2"]'),
      beta1: q('input[data-param="beta1"]'), n: q('input[data-param="n"]') };
    this.outputs = { pi: q('output[data-param-out="pi"]'), beta2: q('output[data-param-out="beta2"]'),
      beta1: q('output[data-param-out="beta1"]'), n: q('output[data-param-out="n"]') };
    this.out = {};
    var outs = el.querySelectorAll('[data-out]');
    for (var i = 0; i < outs.length; i++) this.out[outs[i].getAttribute('data-out')] = outs[i];
    this.flag = q('.fl-flag');
    this.live = q('[data-live]');
    this.plotRaw = makePlot(q('svg[data-plot="raw"]'));
    this.plotRes = makePlot(q('svg[data-plot="resid"]'));
    this.strip = {
      svg: q('svg[data-strip]'),
      mk: { truth: q('[data-mk="truth"]'), naive: q('[data-mk="naive"]'), fwl: q('[data-mk="fwl"]') },
      lab: { truth: q('[data-mk-label="truth"]'), naive: q('[data-mk-label="naive"]'), fwl: q('[data-mk-label="fwl"]') },
      desc: q('svg[data-strip] desc')
    };

    this.bind();
    this.readInputs();
    this.render();
    el.setAttribute('data-ready', '');
  }

  Lab.prototype.bind = function () {
    var self = this;
    ['pi', 'beta2', 'beta1', 'n'].forEach(function (k) {
      var inp = self.inputs[k];
      inp.addEventListener('input', function () {
        if (k === 'n' && self.sample === 0) self.sample = 1; // a new size means a simulated sample
        self.readInputs();
        self.schedule();
      });
      inp.addEventListener('change', function () { self.announceSoon(); });
    });
    var draw = this.el.querySelector('[data-act="draw"]');
    var reset = this.el.querySelector('[data-act="reset"]');
    draw.addEventListener('click', function () {
      self.sample += 1;
      self.readInputs();
      self.schedule();
      self.announceSoon();
    });
    reset.addEventListener('click', function () {
      self.inputs.pi.value = String(DEFAULTS.pi);
      self.inputs.beta2.value = String(DEFAULTS.beta2);
      self.inputs.beta1.value = String(DEFAULTS.beta1);
      self.inputs.n.value = String(DEFAULT_N_INDEX);
      self.sample = self.preset === 'post' ? 0 : 1;
      self.readInputs();
      self.schedule();
      self.announceSoon();
    });
  };

  Lab.prototype.readInputs = function () {
    var inp = this.inputs;
    var clampNum = function (v, lo, hi, dflt) { v = Number(v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : dflt; };
    this.params = {
      pi: round2(clampNum(inp.pi.value, -1.5, 1.5, DEFAULTS.pi)),
      beta2: round2(clampNum(inp.beta2.value, -1, 1, DEFAULTS.beta2)),
      beta1: round2(clampNum(inp.beta1.value, -0.5, 0.5, DEFAULTS.beta1))
    };
    this.nIndex = Math.round(clampNum(inp.n.value, 0, N_STEPS.length - 1, DEFAULT_N_INDEX));
    this.n = N_STEPS[this.nIndex];
    if (this.preset === 'none' && this.sample === 0) this.sample = 1;
    if (this.sample === 0 && this.n !== POST_STORES.income.length) this.sample = 1;
    this.ensureBase();
  };

  Lab.prototype.ensureBase = function () {
    var usePost = this.sample === 0;
    var key = usePost ? 'post' : 'sim:' + this.n + ':' + this.sample;
    if (key === this.baseKey) return;
    this.base = usePost ? postDraws() : simDraws(this.n, SEED_BASE + this.sample);
    this.baseKey = key;
    this.terc = terciles(this.base.I);
  };

  Lab.prototype.isDefault = function () {
    var p = this.params;
    return p.pi === DEFAULTS.pi && p.beta2 === DEFAULTS.beta2 && p.beta1 === DEFAULTS.beta1;
  };

  Lab.prototype.schedule = function () {
    var self = this;
    if (this.frame) return;
    var raf = W.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
    this.frame = raf(function () { self.frame = 0; self.render(); });
  };

  Lab.prototype.render = function () {
    var p = this.params, n = this.base.n;
    var d = buildData(this.base, p);
    var r = summarize(d, p);
    this.last = r;

    // slider outputs + accessible values
    setText(this.outputs.pi, fmt(p.pi, 2));
    setText(this.outputs.beta2, fmt(p.beta2, 2));
    setText(this.outputs.beta1, fmt(p.beta1, 2));
    setText(this.outputs.n, String(this.n));
    this.inputs.pi.setAttribute('aria-valuetext', fmt(p.pi, 2));
    this.inputs.beta2.setAttribute('aria-valuetext', fmt(p.beta2, 2));
    this.inputs.beta1.setAttribute('aria-valuetext', fmt(p.beta1, 2));
    this.inputs.n.setAttribute('aria-valuetext', this.n + ' stores');

    // status line
    var status = this.sample === 0
      ? (this.isDefault() ? 'Showing the post’s 50 stores' : 'The post’s 50 stores, rebuilt with your slopes')
      : 'Simulated sample #' + this.sample + ', n = ' + n;
    setText(this.out.status, status);

    this.drawRaw(d, r, p);
    this.drawResid(r, p);
    this.drawStrip(r, p);
    this.drawReadout(r, p);
  };

  Lab.prototype.drawRaw = function (d, r, p) {
    var plot = this.plotRaw;
    var ex = extent(d.c), ey = extent(d.s);
    var dx = niceDomain(ex[0], ex[1], 5), dy = niceDomain(ey[0], ey[1], 5);
    var sx = linearScale(dx, PX0, PX1), sy = linearScale(dy, PY1, PY0);
    drawTicks(plot, 'x', dx, sx);
    drawTicks(plot, 'y', dy, sy);
    drawPoints(plot, d.c, d.s, this.terc, d.n, sx, sy);
    var L = lineAcross(dx, sx, sy, r.naiveIntercept, r.naive);
    setLine(plot, 'naive', L[0], L[1], L[2], L[3]);
    // true slope drawn through the sample means
    var T = lineAcross(dx, sx, sy, r.meanS - p.beta1 * r.meanC, p.beta1);
    setLine(plot, 'truth', T[0], T[1], T[2], T[3]);
    setText(plot.desc, d.n + ' stores. Sales against coupons, colored by income third. Naive OLS slope ' +
      fmt(r.naive, 4) + '; true coupon effect ' + fmt(p.beta1, 2) + '.');
  };

  Lab.prototype.drawResid = function (r, p) {
    var plot = this.plotRes;
    var dx = symDomain(maxAbs(r.cTilde), 5), dy = symDomain(maxAbs(r.sTilde), 5);
    var sx = linearScale(dx, PX0, PX1), sy = linearScale(dy, PY1, PY0);
    drawTicks(plot, 'x', dx, sx);
    drawTicks(plot, 'y', dy, sy);
    drawPoints(plot, r.cTilde, r.sTilde, this.terc, r.n, sx, sy);
    var F = lineAcross(dx, sx, sy, 0, r.fwl);
    setLine(plot, 'fwl', F[0], F[1], F[2], F[3]);
    var T = lineAcross(dx, sx, sy, 0, p.beta1);
    setLine(plot, 'truth', T[0], T[1], T[2], T[3]);
    setText(plot.desc, r.n + ' stores after partialling out income from both sales and coupons. FWL slope ' +
      fmt(r.fwl, 4) + '; true coupon effect ' + fmt(p.beta1, 2) + '.');
  };

  Lab.prototype.drawStrip = function (r, p) {
    var st = this.strip;
    var scale = function (v) { return SX0 + ((v - SLO) / (SHI - SLO)) * (SX1 - SX0); };
    var vals = { truth: p.beta1, naive: r.naive, fwl: r.fwl };
    var names = { truth: 'true', naive: 'naive', fwl: 'FWL' };
    var pos = [];
    Object.keys(vals).forEach(function (k) {
      var v = vals[k];
      var off = v < SLO ? -1 : v > SHI ? 1 : 0;
      var x = scale(Math.min(SHI, Math.max(SLO, v)));
      st.mk[k].style.transform = 'translate(' + f1(x) + 'px, 0px)';
      st.mk[k].setAttribute('data-off', off ? 'yes' : 'no');
      var name = names[k];
      setText(st.lab[k], off < 0 ? '← ' + name : off > 0 ? name + ' →' : name);
      pos.push({ k: k, x: x });
    });
    // 1-D label repel: keep label centers at least 34 units apart, inside [18, 282].
    pos.sort(function (a, b) { return a.x - b.x; });
    var GAP = 34, it, i;
    var lx = pos.map(function (o) { return o.x; });
    for (it = 0; it < 12; it++) {
      for (i = 1; i < lx.length; i++) {
        var gap = lx[i] - lx[i - 1];
        if (gap < GAP) { var push = (GAP - gap) / 2; lx[i - 1] -= push; lx[i] += push; }
      }
      for (i = 0; i < lx.length; i++) lx[i] = Math.min(282 - 14, Math.max(18 + 14, lx[i]));
    }
    for (i = 0; i < pos.length; i++) st.lab[pos[i].k].style.transform = 'translate(' + f1(lx[i]) + 'px, 0px)';
    setText(st.desc, 'On a slope scale from ' + MINUS + '1.5 to 1.5: true effect ' + fmt(p.beta1, 2) +
      ', naive slope ' + fmt(r.naive, 4) + ', FWL slope ' + fmt(r.fwl, 4) + '.');
  };

  Lab.prototype.flipInfo = function (r, p) {
    if (p.beta1 === 0) {
      return { state: 'na', sample: 'n/a', plim: 'n/a',
        note: 'The true effect is zero, so there is no sign to flip.' };
    }
    var fs = r.naive * p.beta1 < 0, fp = r.plim * p.beta1 < 0;
    var note = fs && fp ? 'Confounding by income reverses the sign of the naive slope.'
      : !fs && !fp ? 'The naive slope keeps the sign of the true effect (its size can still be biased).'
      : fs ? 'This draw flips the sign, but a very large sample would not: sampling noise.'
      : 'A very large sample would flip the sign; this particular draw happens not to.';
    return { state: fs && fp ? 'both' : fs ? 'sample' : fp ? 'plim' : 'none',
      sample: fs ? 'yes' : 'no', plim: fp ? 'yes' : 'no', note: note };
  };

  Lab.prototype.drawReadout = function (r, p) {
    var o = this.out;
    setText(o.beta1, fmt(p.beta1, 4));
    setText(o.naive, fmt(r.naive, 4));
    setText(o.fwl, fmt(r.fwl, 4));
    setText(o.gamma, fmt(r.gamma, 4));
    setText(o.delta, fmt(r.delta, 4));
    setText(o.ovb, fmt(r.ovb, 4));
    setText(o.plim, fmt(r.plim, 4));
    var f = this.flipInfo(r, p);
    this.flag.setAttribute('data-state', f.state);
    setText(o.flipSample, f.sample);
    setText(o.flipPlim, f.plim);
    setText(o.flipNote, f.note);
    this.lastFlip = f;
  };

  Lab.prototype.announceSoon = function () {
    var self = this;
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(function () {
      var r = self.last, p = self.params, f = self.lastFlip;
      if (!r || !self.live) return;
      var msg = (self.sample === 0 ? 'The post’s 50 stores. ' : 'Simulated sample ' + self.sample + ', ' + r.n + ' stores. ') +
        'Naive slope ' + fmt(r.naive, 3) + ', FWL slope ' + fmt(r.fwl, 3) +
        ', true effect ' + fmt(p.beta1, 2) + '. Sign flip in this sample: ' + f.sample + '.';
      self.live.textContent = msg;
    }, 400);
  };

  function initAll() {
    var els = document.querySelectorAll('.fwl-lab[data-fwl-lab]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].hasAttribute('data-ready') || els[i]._fwlLab) continue;
      try {
        els[i]._fwlLab = new Lab(els[i]);
      } catch (e) {
        if (W.console) W.console.error('fwl-lab: could not start', els[i].id, e);
      }
    }
  }

  W.FWLLab = {
    __loaded: true,
    summarize: summarize,
    buildData: buildData,
    postDraws: postDraws,
    simDraws: simDraws,
    plimNaive: plimNaive,
    mulberry32: mulberry32,
    normalGen: normalGen,
    terciles: terciles,
    DEFAULTS: DEFAULTS,
    N_STEPS: N_STEPS,
    POST_STORES: POST_STORES,
    init: initAll
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();
  }
})();
