/*!
 * did-lab.js — inline interactive Difference-in-Differences lab (two tabs).
 *
 * Loaded once per page by layouts/shortcodes/did-lab.html through Hugo Pipes
 * (js.Build, target es2017, minified, fingerprinted). No dependencies.
 * Initializes every `.did-lab[data-did-lab]` element on the page.
 *
 * Both tabs run on the post's REAL data (content/tutorials/python_did101/data/),
 * shifted exactly by the sliders. Every shift lies in the space spanned by the
 * regressors and the fixed effects, so the residuals (and the clustered
 * standard errors of the 2×2 and event-study models) never change, and the
 * defaults reproduce the post to every printed digit:
 *
 *   Tab A (2×2, 35 schools × 2 periods):
 *     gpa' = gpa + (att − ATT0)·txp + (trend − TREND0)·post + viol·txp
 *     ATT0 = 25.3149 and TREND0 = 10.8859 are the post's estimates.
 *     Naive = att + trend + viol; DiD = att + viol (bias = viol, exactly).
 *
 *   Tab B (event study, 35 schools × 8 periods, adoption in period 5):
 *     for treated schools at event time k = period − 5,
 *       D(k) = tau(k) + s·(k + 1),   tau(k) = e0 + g·k (k ≥ 0), a (k = −1), 0 (k ≤ −2)
 *     gpa' = gpa + D(k) − D_default(k), with D_default(k) = 25·[k ≥ 0].
 *     Event-study coefficient k = post estimate + D(k) − D(−1) − D_default(k).
 *     The pooled DiD (one post dummy) is re-estimated from gpa'.
 *
 * Inference: TWFE by two-way demeaning (exact for a balanced panel), standard
 * errors clustered by school (CRV1) with pyfixest/fixest's small-sample factor
 * G/(G−1)·(N−1)/(N−K), K counting the slopes, the period dummies and the
 * constant; 95% intervals use t(G − 1) = t(34).
 *
 * Page-safety contract: this script only writes plain numbers and words into
 * the page (textContent / attributes). It never writes TeX, HTML markup or a
 * dollar sign, so MathJax and the site's code-block scripts never see it.
 *
 * Test hook: window.DidLab = { twoByTwo, eventStudy, GPA2, GPAE, ... }.
 */
(function () {
  'use strict';

  var W = typeof window !== 'undefined' ? window : {};
  if (W.DidLab && W.DidLab.__loaded) return; // loaded twice: keep the first copy

  // The post's data, gpa only, in id-major / period-minor order (ids 1-35;
  // ids 26-35 are the treated schools). Copied from
  // content/tutorials/python_did101/data/tutoring_did.csv and tutoring_didevent.csv
  // at full precision. Do not edit by hand. If the CSVs change, rerun from the
  // repo root:
  //   node -e "const f=n=>require('fs').readFileSync('content/tutorials/python_did101/data/'+n,'utf8').trim().split('\n');const g=n=>{const r=f(n),h=r[0].split(',').indexOf('gpa');return r.slice(1).map(l=>l.split(',')[h]).join(',')};console.log('  var GPA2 = ['+g('tutoring_did.csv')+'];\n  var GPAE = ['+g('tutoring_didevent.csv')+'];')"
  var GPA2 = [72.38992309570312,81.30274963378906,69.8997802734375,81.39221954345703,72.65747833251953,82.16635131835938,71.65027618408203,82.81045532226562,71.4574966430664,81.97605895996094,69.1381607055664,84.55447387695312,70.69261169433594,82.08975982666016,72.46063232421875,81.24214172363281,72.31909942626953,82.4231948852539,70.93537139892578,82.78784942626953,70.25408172607422,82.9945068359375,71.35242462158203,82.64871978759766,71.67696380615234,79.92919158935547,72.4128646850586,85.7488021850586,69.57122802734375,81.45626831054688,72.88899230957031,82.65937805175781,71.61781311035156,81.23416900634766,70.68399810791016,83.21211242675781,70.68522644042969,82.68266296386719,69.5110855102539,81.19770812988281,71.02513885498047,82.01751708984375,72.14630126953125,81.18115997314453,70.15975189208984,79.64729309082031,72.23867797851562,81.91260528564453,70.55317687988281,81.25857543945312,59.4136848449707,94.04179382324219,61.250579833984375,97.09932708740234,60.52789306640625,96.04007720947266,59.846527099609375,96.93856048583984,60.30762481689453,96.4892349243164,60.269508361816406,95.38954162597656,59.536407470703125,96.7745361328125,60.6102409362793,99.1506118774414,59.39085006713867,97.56759643554688,60.50446319580078,94.1744155883789];
  var GPAE = [69.79093170166016,71.3333969116211,73.23677825927734,73.92042541503906,85.46089172363281,87.35575866699219,88.3947525024414,86.56147003173828,70.79762268066406,72.0805435180664,72.2367172241211,72.60227966308594,85.45018768310547,86.66960906982422,86.278076171875,90.2454605102539,69.48332214355469,72.29733276367188,72.31700897216797,73.7732925415039,87.16362762451172,87.68718719482422,83.98756408691406,87.56111145019531,71.4572982788086,71.0417709350586,71.40088653564453,72.24282836914062,84.26522827148438,84.33045959472656,87.21040344238281,86.34205627441406,70.00230407714844,71.58000946044922,74.36431884765625,74.39277648925781,85.88790130615234,82.64810180664062,86.15031433105469,87.8923110961914,71.52882385253906,70.44532775878906,72.43749237060547,74.97225952148438,87.25634002685547,87.17058563232422,88.22023010253906,86.07459259033203,71.84751892089844,72.83026123046875,72.3587875366211,74.5926742553711,84.73660278320312,85.1304702758789,86.47234344482422,88.26471710205078,71.5395736694336,71.92413330078125,73.13880920410156,73.17989349365234,84.33039093017578,84.15740203857422,87.75507354736328,88.7975082397461,71.0893325805664,72.0762939453125,74.38909912109375,73.53125762939453,82.49947357177734,87.46160125732422,85.12257385253906,86.83174896240234,69.86518096923828,71.93949890136719,73.89646911621094,73.36992645263672,84.44633483886719,87.15631103515625,87.07646179199219,88.55984497070312,70.22032165527344,71.10163116455078,73.0916519165039,74.65153503417969,84.5190200805664,88.65878295898438,87.69259643554688,89.52930450439453,68.97347259521484,72.12678527832031,72.98542022705078,73.22512817382812,85.5164794921875,82.07963562011719,88.51578521728516,86.43671417236328,71.0750732421875,71.89962768554688,73.32194519042969,73.591552734375,83.21183013916016,83.32508850097656,87.75724029541016,88.76309204101562,70.094482421875,73.50135803222656,72.68592071533203,74.51915740966797,83.50941467285156,86.11955261230469,87.70372772216797,88.26976776123047,72.00164031982422,73.46800231933594,72.01031494140625,74.16986083984375,85.06485748291016,85.87147521972656,86.81614685058594,87.2499008178711,69.6203842163086,71.34807586669922,72.98706817626953,72.98971557617188,85.92044067382812,85.73856353759766,85.87877655029297,88.36579132080078,71.6135025024414,69.47577667236328,73.84166717529297,73.14507293701172,83.76182556152344,86.04502868652344,88.69686126708984,89.02335357666016,72.83831024169922,71.71102905273438,73.07611083984375,73.282958984375,85.42912292480469,84.53411102294922,87.15895080566406,88.66444396972656,70.98548889160156,71.46269226074219,73.04509735107422,74.53565979003906,86.70768737792969,82.87686920166016,85.24873352050781,88.5893783569336,72.0433578491211,73.0250244140625,73.4953384399414,73.47828674316406,86.24183654785156,86.18621826171875,87.6561279296875,89.30469512939453,71.26358032226562,71.7056884765625,73.97721099853516,74.35881042480469,85.7886734008789,85.69391632080078,87.96878814697266,89.6153335571289,69.40937042236328,73.26973724365234,72.89349365234375,73.69198608398438,83.25045013427734,88.34883880615234,86.43280029296875,88.67643737792969,69.36730194091797,72.32512664794922,71.72061920166016,74.91706848144531,83.79383850097656,88.45128631591797,85.85083770751953,87.03211212158203,70.82332611083984,71.80010223388672,71.63386535644531,74.1978759765625,85.4802017211914,84.39695739746094,85.23330688476562,87.27052307128906,71.07462310791016,72.04064178466797,73.25177764892578,73.9498062133789,84.33248138427734,87.97605895996094,84.60783386230469,90.04193878173828,60.964168548583984,61.96593475341797,63.38909149169922,63.985931396484375,99.50027465820312,100.94769287109375,99.53545379638672,107.67698669433594,62.547149658203125,60.663333892822266,61.58812713623047,63.25226974487305,98.34502410888672,99.99615478515625,101.95291137695312,101.50790405273438,61.5259895324707,62.39915466308594,65.05307006835938,65.15103912353516,100.77691650390625,99.14639282226562,102.82219696044922,101.65689086914062,61.10239028930664,60.34636688232422,64.4942398071289,64.28345489501953,100.82027435302734,101.10053253173828,98.8876953125,105.14276885986328,60.127418518066406,60.18752670288086,64.47874450683594,64.33682250976562,100.58303833007812,102.75030517578125,98.86026763916016,104.09455871582031,61.469635009765625,63.044761657714844,63.19792938232422,63.5730094909668,101.66309356689453,99.59954833984375,101.90402221679688,101.87008666992188,60.46222686767578,62.315311431884766,65.94075775146484,63.41502380371094,99.65150451660156,101.93626403808594,101.91781616210938,106.30514526367188,61.38686752319336,61.34822082519531,62.69280242919922,64.07492065429688,98.781982421875,99.95635223388672,103.79082489013672,102.11698150634766,60.07783126831055,61.622711181640625,62.13844680786133,62.80452346801758,100.82030487060547,99.61103820800781,103.32422637939453,105.16927337646484,61.318885803222656,62.05076599121094,62.51813888549805,63.27632141113281,98.98401641845703,100.47611999511719,102.68449401855469,103.09986877441406];

  var G = 35;                 // schools (clusters)
  var FIRST_TREATED = 26;     // ids 26..35 are treated
  var ADOPT = 5;              // first treated period in the event-study file
  var EVENT_K = [-4, -3, -2, 0, 1, 2, 3];
  var T_CRIT = 2.0322445093177186; // t(0.975, 34)
  var DEFAULTS_A = { viol: 0 };
  var DEFAULTS_B = { e0: 25, g: 0, a: 0, s: 0 };
  var SLIDER_A = { att: 25.5, trend: 11, viol: 0 }; // on-grid slider positions
  var MINUS = '−';
  var SVGNS = 'http://www.w3.org/2000/svg';

  function isTreated(id) { return id >= FIRST_TREATED; }

  /* ------------------------------------------------------------------ */
  /* Estimation                                                          */
  /* ------------------------------------------------------------------ */

  // Two-way demeaning of a balanced panel stored id-major (G units x T).
  function demean2(v, T) {
    var n = v.length, i, t, rowM = new Array(G), colM = new Array(T), all = 0;
    for (i = 0; i < G; i++) { rowM[i] = 0; for (t = 0; t < T; t++) rowM[i] += v[i * T + t]; rowM[i] /= T; }
    for (t = 0; t < T; t++) { colM[t] = 0; for (i = 0; i < G; i++) colM[t] += v[i * T + t]; colM[t] /= G; }
    for (i = 0; i < n; i++) all += v[i];
    all /= n;
    var out = new Array(n);
    for (i = 0; i < G; i++) for (t = 0; t < T; t++) out[i * T + t] = v[i * T + t] - rowM[i] - colM[t] + all;
    return out;
  }

  // Solve A x = b (small dense system, Gaussian elimination with pivoting).
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.slice().concat([b[i]]); }), i, j, k;
    for (i = 0; i < n; i++) {
      var p = i;
      for (k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
      var tmp = M[i]; M[i] = M[p]; M[p] = tmp;
      for (k = i + 1; k < n; k++) {
        var f = M[k][i] / M[i][i];
        for (j = i; j <= n; j++) M[k][j] -= f * M[i][j];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      var s = M[i][n];
      for (j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }

  function invert(A) {
    var n = A.length, inv = [], c, e;
    for (c = 0; c < n; c++) {
      e = new Array(n).fill(0); e[c] = 1;
      inv.push(solve(A, e));
    }
    // inv holds columns; transpose to rows (A is symmetric, so this is a no-op in exact arithmetic)
    return inv[0].map(function (_, r) { return inv.map(function (col) { return col[r]; }); });
  }

  // TWFE with slopes X (array of columns), clustered (CRV1) by school.
  // Returns coefficients and standard errors; K = slopes + (T - 1) + 1.
  function twfe(y, X, T) {
    var p = X.length, n = y.length, i, j, r;
    var yt = demean2(y, T);
    var Xt = X.map(function (col) { return demean2(col, T); });
    var XtX = [], Xty = new Array(p);
    for (i = 0; i < p; i++) {
      XtX.push(new Array(p));
      Xty[i] = 0;
      for (r = 0; r < n; r++) Xty[i] += Xt[i][r] * yt[r];
      for (j = 0; j < p; j++) {
        var s = 0;
        for (r = 0; r < n; r++) s += Xt[i][r] * Xt[j][r];
        XtX[i][j] = s;
      }
    }
    var b = solve(XtX, Xty);
    var e = new Array(n);
    for (r = 0; r < n; r++) {
      var fit = 0;
      for (i = 0; i < p; i++) fit += b[i] * Xt[i][r];
      e[r] = yt[r] - fit;
    }
    var meat = [];
    for (i = 0; i < p; i++) meat.push(new Array(p).fill(0));
    for (var gIdx = 0; gIdx < G; gIdx++) {
      var sc = new Array(p).fill(0);
      for (var t = 0; t < T; t++) {
        r = gIdx * T + t;
        for (i = 0; i < p; i++) sc[i] += Xt[i][r] * e[r];
      }
      for (i = 0; i < p; i++) for (j = 0; j < p; j++) meat[i][j] += sc[i] * sc[j];
    }
    var K = p + (T - 1) + 1;
    var ssc = G / (G - 1) * (n - 1) / (n - K);
    var B = invert(XtX), V = [];
    for (i = 0; i < p; i++) {
      V.push(new Array(p).fill(0));
      for (j = 0; j < p; j++) {
        var acc = 0;
        for (var u = 0; u < p; u++) for (var w = 0; w < p; w++) acc += B[i][u] * meat[u][w] * B[w][j];
        V[i][j] = ssc * acc;
      }
    }
    return { b: b, se: V.map(function (row, k) { return Math.sqrt(row[k]); }) };
  }

  // Group means of a 2x2 panel (id-major, T = 2).
  function means2(y) {
    var m = { c0: 0, c1: 0, t0: 0, t1: 0 }, nc = 0, nt = 0;
    for (var i = 0; i < G; i++) {
      var tr = isTreated(i + 1);
      if (tr) { m.t0 += y[2 * i]; m.t1 += y[2 * i + 1]; nt++; }
      else { m.c0 += y[2 * i]; m.c1 += y[2 * i + 1]; nc++; }
    }
    m.c0 /= nc; m.c1 /= nc; m.t0 /= nt; m.t1 /= nt;
    return m;
  }

  var BASE2 = means2(GPA2);
  var ATT0 = (BASE2.t1 - BASE2.t0) - (BASE2.c1 - BASE2.c0); // 25.3149
  var TREND0 = BASE2.c1 - BASE2.c0;                          // 10.8859

  // Tab A: p = { att, trend, viol }.
  function twoByTwo(p) {
    var n = GPA2.length, y = new Array(n), post = new Array(n), txp = new Array(n);
    for (var r = 0; r < n; r++) {
      var id = Math.floor(r / 2) + 1, ps = r % 2, tr = isTreated(id) ? 1 : 0;
      post[r] = ps; txp[r] = tr * ps;
      y[r] = GPA2[r] + (p.att - ATT0) * txp[r] + (p.trend - TREND0) * ps + p.viol * txp[r];
    }
    var m = means2(y);
    var fit = twfe(y, [txp], 2);
    var ctrend = m.c1 - m.c0;
    return {
      y: y, m: m,
      naive: m.t1 - m.t0,
      did: fit.b[0], se: fit.se[0],
      ctrend: ctrend,
      cfDid: m.t0 + ctrend,
      cfTrue: m.t0 + ctrend + p.viol,
      truth: p.att
    };
  }

  function tau(k, p) {
    if (k >= 0) return p.e0 + p.g * k;
    if (k === -1) return p.a;
    return 0;
  }
  function dev(k, p) { return tau(k, p) + p.s * (k + 1); }

  // Tab B: p = { e0, g, a, s }.
  function eventStudy(p) {
    var T = 8, n = GPAE.length, y = new Array(n), r;
    var X = EVENT_K.map(function () { return new Array(n).fill(0); });
    var txp = new Array(n).fill(0);
    for (r = 0; r < n; r++) {
      var id = Math.floor(r / T) + 1, per = r % T + 1;
      y[r] = GPAE[r];
      if (!isTreated(id)) continue;
      var k = per - ADOPT;
      y[r] += dev(k, p) - dev(k, DEFAULTS_B);
      var col = EVENT_K.indexOf(k);
      if (col >= 0) X[col][r] = 1;
      if (per >= ADOPT) txp[r] = 1;
    }
    var es = twfe(y, X, T);
    var pooled = twfe(y, [txp], T);
    var truthPath = [-4, -3, -2, -1, 0, 1, 2, 3].map(function (k) { return tau(k, p); });
    var avgTrue = (tau(0, p) + tau(1, p) + tau(2, p) + tau(3, p)) / 4;
    var est = EVENT_K.map(function (k, j) {
      return { k: k, b: es.b[j], se: es.se[j], lo: es.b[j] - T_CRIT * es.se[j], hi: es.b[j] + T_CRIT * es.se[j] };
    });
    return {
      est: est, truthPath: truthPath, avgTrue: avgTrue,
      pooled: pooled.b[0], pooledSe: pooled.se[0]
    };
  }

  /* ------------------------------------------------------------------ */
  /* Formatting and SVG helpers                                          */
  /* ------------------------------------------------------------------ */

  function fmt(v, dp) {
    var s = Math.abs(v).toFixed(dp);
    if (Number(s) === 0) return (0).toFixed(dp);
    return (v < 0 ? MINUS : '') + s;
  }
  function fmtSigned(v, dp) {
    var s = fmt(v, dp);
    return (v > 0 && Number(Math.abs(v).toFixed(dp)) !== 0 ? '+' : '') + s;
  }
  function niceStep(span, target) {
    var raw = span / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  }
  function niceDomain(lo, hi, target) {
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var st = niceStep(hi - lo, target);
    return { lo: Math.floor(lo / st) * st, hi: Math.ceil(hi / st) * st, step: st };
  }
  function scale(dom, r0, r1) {
    var k = (r1 - r0) / (dom.hi - dom.lo);
    return function (v) { return r0 + (v - dom.lo) * k; };
  }
  function svgEl(tag, cls) {
    var e = document.createElementNS(SVGNS, tag);
    if (cls) e.setAttribute('class', cls);
    return e;
  }
  function setText(el, txt) { if (el && el.textContent !== txt) el.textContent = txt; }
  function r1(v) { return Math.round(v * 10) / 10; }

  // Horizontal gridlines and labels for a y domain.
  function yTicks(g, dom, ys, x0, x1) {
    while (g.firstChild) g.removeChild(g.firstChild);
    var dp = dom.step < 1 ? 1 : 0;
    for (var v = dom.lo; v <= dom.hi + 1e-9; v += dom.step) {
      var yy = r1(ys(v));
      var ln = svgEl('path', 'dl-gridline');
      ln.setAttribute('d', 'M' + x0 + ' ' + yy + 'L' + x1 + ' ' + yy);
      g.appendChild(ln);
      var tx = svgEl('text');
      tx.setAttribute('x', x0 - 5); tx.setAttribute('y', yy + 3.5); tx.setAttribute('text-anchor', 'end');
      tx.textContent = fmt(v, dp);
      g.appendChild(tx);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Tab A: the 2×2 lab                                                  */
  /* ------------------------------------------------------------------ */

  var PA = { x0: 46, x1: 308, y0: 12, y1: 192, pre: 112, post: 242 };

  function TwoLab(lab, root) {
    this.lab = lab; this.root = root;
    var q = function (s) { return root.querySelector(s); };
    this.inp = {}; this.outp = {};
    var self = this;
    ['att', 'trend', 'viol'].forEach(function (k) {
      self.inp[k] = q('input[data-param="' + k + '"]');
      self.outp[k] = q('output[data-param-out="' + k + '"]');
    });
    this.pristine = { att: true, trend: true };
    this.svg = q('svg[data-plot="twobytwo"]');
    this.yTicks = this.svg.querySelector('[data-ticks="y"]');
    this.ptsG = this.svg.querySelector('[data-pts="pts"]');
    this.lines = {};
    ['comp', 'treat', 'cf', 'truecf', 'gap'].forEach(function (k) {
      self.lines[k] = self.svg.querySelector('[data-line="' + k + '"]');
    });
    this.gapLab = this.svg.querySelector('[data-lab="gap"]');
    this.strip = q('svg[data-strip="strip"]');
    this.out = {};
    ['att', 'naive', 'did', 'ctrend', 'biasNaive', 'biasDid', 'flagA', 'flagSubA'].forEach(function (k) {
      self.out[k] = q('[data-out="' + k + '"]');
    });
    this.flag = q('[data-flag="a"]');
    this.dots = [];
    for (var r = 0; r < GPA2.length; r++) {
      var c = svgEl('circle', 'dl-pt ' + (isTreated(Math.floor(r / 2) + 1) ? 'dl-pt-treat' : 'dl-pt-comp'));
      c.setAttribute('r', '2.6');
      this.ptsG.appendChild(c);
      this.dots.push(c);
    }
    this.bind();
  }

  TwoLab.prototype.bind = function () {
    var self = this;
    ['att', 'trend', 'viol'].forEach(function (k) {
      self.inp[k].addEventListener('input', function () {
        if (k in self.pristine) self.pristine[k] = false;
        self.lab.schedule();
      });
      self.inp[k].addEventListener('change', function () { self.lab.announceSoon(); });
    });
    this.root.querySelector('[data-act="reset"]').addEventListener('click', function () { self.reset(); });
  };

  TwoLab.prototype.reset = function () {
    this.pristine = { att: true, trend: true };
    this.inp.att.value = SLIDER_A.att;
    this.inp.trend.value = SLIDER_A.trend;
    this.inp.viol.value = DEFAULTS_A.viol;
    this.lab.schedule();
    this.lab.announceSoon();
  };

  TwoLab.prototype.params = function () {
    return {
      att: this.pristine.att ? ATT0 : Number(this.inp.att.value),
      trend: this.pristine.trend ? TREND0 : Number(this.inp.trend.value),
      viol: Number(this.inp.viol.value)
    };
  };

  TwoLab.prototype.isDefault = function () {
    return this.pristine.att && this.pristine.trend && Number(this.inp.viol.value) === 0;
  };

  TwoLab.prototype.status = function () {
    return this.isDefault() ? 'The post’s 70 school-periods' : 'The post’s data, shifted by the sliders';
  };

  TwoLab.prototype.render = function () {
    var p = this.params(), R = twoByTwo(p);
    this.last = { p: p, R: R };
    setText(this.outp.att, fmt(p.att, 2));
    setText(this.outp.trend, fmt(p.trend, 2));
    setText(this.outp.viol, fmtSigned(p.viol, 2));

    // Scatter + means
    var lo = Math.min.apply(null, R.y.concat([R.cfTrue, R.cfDid])), hi = Math.max.apply(null, R.y.concat([R.cfTrue, R.cfDid]));
    var dom = niceDomain(lo, hi, 5), ys = scale(dom, PA.y1, PA.y0);
    yTicks(this.yTicks, dom, ys, PA.x0, PA.x1);
    for (var r = 0; r < R.y.length; r++) {
      var id = Math.floor(r / 2) + 1, tr = isTreated(id), base = r % 2 ? PA.post : PA.pre;
      var jitter = ((id * 37) % 11 - 5) * 1.6;
      this.dots[r].setAttribute('cx', r1(base + (tr ? 14 : -14) + jitter));
      this.dots[r].setAttribute('cy', r1(ys(R.y[r])));
    }
    var m = R.m;
    function seg(a, b) { return 'M' + PA.pre + ' ' + r1(ys(a)) + 'L' + PA.post + ' ' + r1(ys(b)); }
    this.lines.comp.setAttribute('d', seg(m.c0, m.c1));
    this.lines.treat.setAttribute('d', seg(m.t0, m.t1));
    this.lines.cf.setAttribute('d', seg(m.t0, R.cfDid));
    this.lines.truecf.setAttribute('d', Math.abs(p.viol) > 1e-9 ? seg(m.t0, R.cfTrue) : '');
    var gx = PA.post + 26;
    this.lines.gap.setAttribute('d', 'M' + gx + ' ' + r1(ys(R.cfDid)) + 'L' + gx + ' ' + r1(ys(m.t1)) +
      'M' + (gx - 4) + ' ' + r1(ys(R.cfDid)) + 'L' + (gx + 4) + ' ' + r1(ys(R.cfDid)) +
      'M' + (gx - 4) + ' ' + r1(ys(m.t1)) + 'L' + (gx + 4) + ' ' + r1(ys(m.t1)));
    this.gapLab.setAttribute('x', gx + 6);
    this.gapLab.setAttribute('y', r1((ys(R.cfDid) + ys(m.t1)) / 2 + 3.5));
    setText(this.gapLab, 'DiD ' + fmt(R.did, 2));

    this.drawStrip(R);

    setText(this.out.att, fmt(R.truth, 2));
    setText(this.out.naive, fmt(R.naive, 2));
    setText(this.out.did, fmt(R.did, 2) + ' (SE ' + fmt(R.se, 3) + ')');
    setText(this.out.ctrend, fmtSigned(R.ctrend, 2));
    setText(this.out.biasNaive, fmtSigned(R.naive - R.truth, 2));
    setText(this.out.biasDid, fmtSigned(R.did - R.truth, 2));

    var state, msg, sub;
    if (Math.abs(p.viol) < 1e-9) {
      state = 'ok';
      msg = 'Parallel trends holds: DiD recovers the true effect exactly.';
      sub = 'The naive estimate is off by the whole common trend (' + fmtSigned(p.trend, 2) + '). The SE stays ' + fmt(R.se, 3) + ': the sliders move the means, not the noise.';
    } else {
      state = 'bias';
      msg = 'Parallel trends fails: DiD is off by the violation, ' + fmtSigned(p.viol, 2) + ' points.';
      sub = 'The data alone cannot tell this bias apart from a real effect: both raise treated schools after the program. The standard error (' + fmt(R.se, 3) + ') does not warn you.';
    }
    this.flag.setAttribute('data-state', state);
    setText(this.out.flagA, msg);
    setText(this.out.flagSubA, sub);
  };

  TwoLab.prototype.drawStrip = function (R) {
    var vals = [R.truth, R.naive, R.did];
    var dom = niceDomain(Math.min(0, Math.min.apply(null, vals)), Math.max.apply(null, vals), 6);
    var xs = scale(dom, 16, 284);
    var g = this.strip.querySelector('[data-ticks="x"]');
    while (g.firstChild) g.removeChild(g.firstChild);
    for (var v = dom.lo; v <= dom.hi + 1e-9; v += dom.step) {
      var tk = svgEl('path', 'dl-strip-tick');
      tk.setAttribute('d', 'M' + r1(xs(v)) + ' 31L' + r1(xs(v)) + ' 37');
      g.appendChild(tk);
      var tx = svgEl('text');
      tx.setAttribute('x', r1(xs(v))); tx.setAttribute('y', 56); tx.setAttribute('text-anchor', 'middle');
      tx.textContent = fmt(v, 0);
      g.appendChild(tx);
    }
    var self = this, pos = { truth: xs(R.truth), naive: xs(R.naive), did: xs(R.did) };
    Object.keys(pos).forEach(function (k) {
      self.strip.querySelector('[data-mk="' + k + '"]').setAttribute('transform', 'translate(' + r1(pos[k]) + ' 0)');
    });
    // Labels: spread apart when markers overlap.
    var order = Object.keys(pos).sort(function (a, b) { return pos[a] - pos[b]; }), lx = [];
    order.forEach(function (k, i) {
      var x = pos[k];
      if (i > 0 && x - lx[i - 1] < 30) x = lx[i - 1] + 30;
      lx.push(x);
    });
    var over = lx[lx.length - 1] - 284;
    if (over > 0) lx = lx.map(function (x) { return x - over; });
    order.forEach(function (k, i) {
      self.strip.querySelector('[data-mk-label="' + k + '"]').setAttribute('x', r1(lx[i]));
    });
  };

  TwoLab.prototype.announcement = function () {
    var R = this.last.R;
    return 'True effect ' + fmt(R.truth, 2) + '. Naive ' + fmt(R.naive, 2) + '. DiD ' + fmt(R.did, 2) +
      ', bias ' + fmtSigned(R.did - R.truth, 2) + '.';
  };

  /* ------------------------------------------------------------------ */
  /* Tab B: the event-study lab                                          */
  /* ------------------------------------------------------------------ */

  var PB = { x0: 56, x1: 490, y0: 14, y1: 248 };

  function EventLab(lab, root) {
    this.lab = lab; this.root = root;
    var q = function (s) { return root.querySelector(s); };
    var self = this;
    this.inp = {}; this.outp = {};
    ['e0', 'g', 'a', 's'].forEach(function (k) {
      self.inp[k] = q('input[data-param="' + k + '"]');
      self.outp[k] = q('output[data-param-out="' + k + '"]');
    });
    this.svg = q('svg[data-plot="event"]');
    this.yTicks = this.svg.querySelector('[data-ticks="y"]');
    this.xTicks = this.svg.querySelector('[data-ticks="x"]');
    this.ciG = this.svg.querySelector('[data-ci="ci"]');
    this.mkG = this.svg.querySelector('[data-mk="est"]');
    this.lines = {};
    ['zero', 'onset', 'truth', 'pooled'].forEach(function (k) {
      self.lines[k] = self.svg.querySelector('[data-line="' + k + '"]');
    });
    this.pooledLab = this.svg.querySelector('[data-lab="pooled"]');
    this.pooledVal = this.svg.querySelector('[data-lab="pooledv"]');
    this.out = {};
    ['avgTrue', 'pooled', 'biasPooled', 'leads', 'lags', 'sigLeads', 'flagB', 'flagSubB'].forEach(function (k) {
      self.out[k] = q('[data-out="' + k + '"]');
    });
    this.flag = q('[data-flag="b"]');
    this.xs = scale({ lo: -4.5, hi: 3.5 }, PB.x0, PB.x1);
    // x ticks (fixed)
    for (var k = -4; k <= 3; k++) {
      var tx = svgEl('text');
      tx.setAttribute('x', r1(this.xs(k))); tx.setAttribute('y', 263); tx.setAttribute('text-anchor', 'middle');
      tx.textContent = fmt(k, 0);
      this.xTicks.appendChild(tx);
    }
    this.cis = []; this.mks = [];
    for (var j = 0; j < 8; j++) {
      var ci = svgEl('path', 'dl-ci'); this.ciG.appendChild(ci); this.cis.push(ci);
      var mk = svgEl('circle', j === 3 ? 'dl-est dl-est-ref' : 'dl-est'); mk.setAttribute('r', j === 3 ? '3.4' : '4');
      this.mkG.appendChild(mk); this.mks.push(mk);
    }
    this.bind();
  }

  EventLab.prototype.bind = function () {
    var self = this;
    ['e0', 'g', 'a', 's'].forEach(function (k) {
      self.inp[k].addEventListener('input', function () { self.lab.schedule(); });
      self.inp[k].addEventListener('change', function () { self.lab.announceSoon(); });
    });
    this.root.querySelector('[data-act="reset"]').addEventListener('click', function () {
      Object.keys(DEFAULTS_B).forEach(function (k) { self.inp[k].value = DEFAULTS_B[k]; });
      self.lab.schedule();
      self.lab.announceSoon();
    });
  };

  EventLab.prototype.params = function () {
    var self = this, p = {};
    Object.keys(DEFAULTS_B).forEach(function (k) { p[k] = Number(self.inp[k].value); });
    return p;
  };

  EventLab.prototype.isDefault = function () {
    var p = this.params();
    return Object.keys(DEFAULTS_B).every(function (k) { return p[k] === DEFAULTS_B[k]; });
  };

  EventLab.prototype.status = function () {
    return this.isDefault() ? 'The post’s 280 school-periods' : 'The post’s data, shifted by the sliders';
  };

  EventLab.prototype.render = function () {
    var p = this.params(), R = eventStudy(p);
    this.last = { p: p, R: R };
    setText(this.outp.e0, fmt(p.e0, 1));
    setText(this.outp.g, fmtSigned(p.g, 1));
    setText(this.outp.a, fmtSigned(p.a, 1));
    setText(this.outp.s, fmtSigned(p.s, 1));

    var pts = [];
    R.est.forEach(function (e) { pts.push(e.lo, e.hi); });
    pts = pts.concat(R.truthPath, [0, R.pooled]);
    var dom = niceDomain(Math.min.apply(null, pts), Math.max.apply(null, pts), 5);
    var ys = scale(dom, PB.y1, PB.y0), xs = this.xs;
    yTicks(this.yTicks, dom, ys, PB.x0, PB.x1);
    this.lines.zero.setAttribute('d', 'M' + PB.x0 + ' ' + r1(ys(0)) + 'L' + PB.x1 + ' ' + r1(ys(0)));
    this.lines.onset.setAttribute('d', 'M' + r1(xs(-0.5)) + ' ' + PB.y0 + 'L' + r1(xs(-0.5)) + ' ' + PB.y1);

    var all = R.est.slice(0, 3).concat([{ k: -1, b: 0, lo: 0, hi: 0, ref: true }], R.est.slice(3));
    var self = this;
    all.forEach(function (e, j) {
      var x = r1(xs(e.k));
      self.cis[j].setAttribute('d', e.ref ? '' : 'M' + x + ' ' + r1(ys(e.lo)) + 'L' + x + ' ' + r1(ys(e.hi)) +
        'M' + (x - 3.5) + ' ' + r1(ys(e.lo)) + 'L' + (x + 3.5) + ' ' + r1(ys(e.lo)) +
        'M' + (x - 3.5) + ' ' + r1(ys(e.hi)) + 'L' + (x + 3.5) + ' ' + r1(ys(e.hi)));
      self.mks[j].setAttribute('cx', x);
      self.mks[j].setAttribute('cy', r1(ys(e.b)));
    });
    var tp = R.truthPath.map(function (v, j) { return (j ? 'L' : 'M') + r1(xs(j - 4)) + ' ' + r1(ys(v)); }).join('');
    this.lines.truth.setAttribute('d', tp);
    var yp = r1(ys(R.pooled));
    this.lines.pooled.setAttribute('d', 'M' + r1(xs(-0.3)) + ' ' + yp + 'L' + PB.x1 + ' ' + yp);
    // Label in the right margin, outside the plotting area.
    var ly = Math.min(Math.max(yp - 2, PB.y0 + 10), PB.y1 - 14);
    this.pooledLab.setAttribute('y', r1(ly));
    this.pooledVal.setAttribute('y', r1(ly + 12));
    setText(this.pooledLab, 'pooled');
    setText(this.pooledVal, fmt(R.pooled, 2));

    var leads = R.est.slice(0, 3), lags = R.est.slice(3);
    var sig = leads.filter(function (e) { return e.lo > 0 || e.hi < 0; });
    setText(this.out.avgTrue, fmt(R.avgTrue, 2));
    setText(this.out.pooled, fmt(R.pooled, 2) + ' (SE ' + fmt(R.pooledSe, 3) + ')');
    setText(this.out.biasPooled, fmtSigned(R.pooled - R.avgTrue, 2));
    setText(this.out.leads, leads.map(function (e) { return fmt(e.b, 2); }).join(', '));
    setText(this.out.lags, lags.map(function (e) { return fmt(e.b, 2); }).join(', '));
    setText(this.out.sigLeads, sig.length + ' of 3');

    var state = 'ok', msg, sub;
    if (Math.abs(p.a) > 1e-9 && Math.abs(p.s) < 1e-9) {
      state = 'bias';
      msg = 'Anticipation contaminates the reference period: every coefficient shifts by ' + fmtSigned(-p.a, 1) + '.';
      sub = 'The event study measures each effect relative to t = −1, which already contains ' + fmtSigned(p.a, 1) + ' of effect. The leads move too, so they can look like a pre-trend.';
    } else if (Math.abs(p.s) > 1e-9) {
      state = 'bias';
      msg = 'A pre-trend of ' + fmtSigned(p.s, 1) + ' per period tilts every coefficient.';
      sub = sig.length ? sig.length + ' of 3 leads exclude zero here, so the event study flags the problem. The pooled DiD is off by ' + fmtSigned(R.pooled - R.avgTrue, 2) + '.'
        : 'No lead is significant, yet the pooled DiD is off by ' + fmtSigned(R.pooled - R.avgTrue, 2) + ': a pre-test that passes does not prove parallel trends.';
    } else if (Math.abs(p.g) > 1e-9) {
      state = 'mild';
      msg = 'Dynamic effects: the lags trace the true path; the pooled DiD averages it.';
      sub = 'Pooled ' + fmt(R.pooled, 2) + ' vs an average true effect of ' + fmt(R.avgTrue, 2) + '. With one adoption date the pooled estimate stays close; with staggered adoption it can be badly biased.';
    } else {
      msg = this.isDefault() ? 'The post’s event study: leads near zero, lags near 25.'
        : 'Parallel trends holds: the lags sit on the true effect up to the sample’s own noise.';
      sub = 'The gaps between the dots and the dashed line are the real data’s noise. The pooled DiD (' + fmt(R.pooled, 2) + ') averages the four lags minus the mean of the leads and t = −1.';
    }
    this.flag.setAttribute('data-state', state);
    setText(this.out.flagB, msg);
    setText(this.out.flagSubB, sub);
  };

  EventLab.prototype.announcement = function () {
    var R = this.last.R;
    return 'Pooled DiD ' + fmt(R.pooled, 2) + ' versus an average true effect of ' + fmt(R.avgTrue, 2) +
      '. Leads ' + R.est.slice(0, 3).map(function (e) { return fmt(e.b, 2); }).join(', ') + '.';
  };

  /* ------------------------------------------------------------------ */
  /* Lab shell: tabs, scheduling, announcements                          */
  /* ------------------------------------------------------------------ */

  function Lab(el) {
    this.el = el;
    this.status = el.querySelector('[data-out="status"]');
    this.live = el.querySelector('[data-live="live"]');
    this.tabs = Array.prototype.slice.call(el.querySelectorAll('.dl-tab'));
    this.panels = {
      twobytwo: el.querySelector('[data-panel="twobytwo"]'),
      event: el.querySelector('[data-panel="event"]')
    };
    this.two = new TwoLab(this, this.panels.twobytwo);
    this.ev = new EventLab(this, this.panels.event);
    this.bindTabs();
    this.select(el.getAttribute('data-tab') === 'event' ? 'event' : 'twobytwo', false);
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
    setText(this.status, this.active === 'event' ? this.ev.status() : this.two.status());
  };

  Lab.prototype.schedule = function () {
    var self = this;
    if (this.frame) return;
    var raf = W.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
    this.frame = raf(function () { self.frame = 0; self.render(); });
  };

  Lab.prototype.render = function () {
    this.two.render();
    this.ev.render();
    this.updateStatus();
  };

  Lab.prototype.announceSoon = function () {
    var self = this;
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(function () {
      if (!self.live) return;
      if (self.frame) { self.announceSoon(); return; }
      self.live.textContent = self.active === 'event' ? self.ev.announcement() : self.two.announcement();
    }, 400);
  };

  function initAll() {
    var els = document.querySelectorAll('.did-lab[data-did-lab]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].hasAttribute('data-ready') || els[i]._didLab) continue;
      try {
        els[i]._didLab = new Lab(els[i]);
      } catch (e) {
        if (W.console) W.console.error('did-lab: could not start', els[i].id, e);
      }
    }
  }

  W.DidLab = {
    __loaded: true,
    twoByTwo: twoByTwo,
    eventStudy: eventStudy,
    twfe: twfe,
    demean2: demean2,
    GPA2: GPA2,
    GPAE: GPAE,
    ATT0: ATT0,
    TREND0: TREND0,
    DEFAULTS_B: DEFAULTS_B,
    T_CRIT: T_CRIT,
    init: initAll
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();
  }
})();
