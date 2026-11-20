/*!
 * spill-lab.js: inline interactive lab for the spatial ripple of a policy.
 *
 * Loaded once per page by layouts/shortcodes/spill-lab.html through Hugo Pipes
 * (js.Build, target es2017, minified, fingerprinted). No dependencies.
 * Initializes every `.spill-lab[data-spill-lab]` element on the page.
 *
 * Written for content/tutorials/python_sc_bayes_spatial (section 9.7). It
 * evaluates the closed form of section 9.3,
 *
 *   xi_c = (I − rho·Wn)^(−1) · rho · wn · xi0,
 *
 * where Wn is the row-normalised rook contiguity of the 38 donors, wn puts
 * weight 1 on Nevada (the only donor that borders California), and xi0 is the
 * effect on California. With `rounds` set, the inverse is replaced by the
 * first terms of its Neumann series I + rho·Wn + (rho·Wn)^2 + ..., so that
 * round k reaches the states k steps from the origin. For a donor origin j,
 * the shock e_j·xi0 hits that donor directly and ripples through Wn alone.
 * The implied bias of a SUTVA-imposing estimate is −Σ alpha_j·xi_c,j with the
 * posterior mean weights alpha of scspill, and the naive estimate is
 * xi0 + bias. Defaults reproduce build_spill_lab_data.py to 1e-9.
 *
 * Page-safety contract: this script only writes plain numbers and words into
 * the page (textContent / attributes). It never writes TeX, HTML markup or a
 * dollar sign.
 *
 * Test hook: window.SpillLab = { DATA, compute, DEFAULTS, ... }.
 */
(function () {
  'use strict';

  var G = typeof window !== 'undefined' ? window : {};
  if (G.SpillLab && G.SpillLab.__loaded) return;

  // BEGIN GENERATED DATA
  // Written by content/tutorials/python_sc_bayes_spatial/build_spill_lab_data.py. Do not edit by hand.
  var DATA = {"donors":["Alabama","Arkansas","Colorado","Connecticut","Delaware","Georgia","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Mexico","North Carolina","North Dakota","Ohio","Oklahoma","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","West Virginia","Wisconsin","Wyoming"],"adj":[[5,15,30],[12,15,16,25,30,31],[10,18,21,25,32,37],[27],[26],[0,22,28,30],[17,19,32,37],[8,9,11,16,36],[7,11,24],[7,14,16,18,29,36],[2,16,18,25],[7,8,16,24,30,34,35],[1,15,31],[20],[9,23,29,36],[0,1,12,30],[1,7,9,10,11,18,25,30],[6,23,29,37],[2,9,10,16,29,37],[6,32],[13,33],[2,25,31],[5,28,30,34],[14,17,29],[8,11,26,35],[1,2,10,16,21,31],[4,24,35],[3],[5,22],[9,14,17,18,23,37],[0,1,5,11,15,16,22,34],[1,12,21,25],[2,6,19,37],[20],[11,22,30,35],[11,24,26,34],[7,9,14],[2,6,17,18,29,32]],"alpha":[0.0241522204151258,-0.001348746592775,0.0203739755976216,0.2296123123540205,0.0172934265975705,-0.00883225203996,0.0122154433909297,0.1048784716285527,-0.025340750385113,0.0070067514764279,0.0434976659070824,0.0085092874632009,0.0135302368408566,0.0469030116069118,-0.0060011211793296,-0.033534295696966,0.0087003344090949,0.12887758118076,0.0323697007536377,0.199720586185659,0.0011543934014319,0.0138473286329975,0.0142507259087069,-0.0111857574261658,0.0521485403583069,-0.0043113760034601,-0.0015543047648357,0.0288249229312692,0.0042801295942258,0.0181685011115202,-0.2504845094788021,-0.0083070401523234,0.0361564814322047,-0.0036895977519046,0.023347009774684,0.1253034356393191,0.0208513646344704,0.0038471712387163],"postMean":[-8.177068075369658e-06,-0.0001975331779215,-0.0311139384625786,-8.017939133144235e-14,-4.486495191945148e-07,-4.426943304314189e-06,-0.4929015689599692,-0.000115464520064,-1.847208611485485e-05,-0.0008243318219213,-0.0033298965533419,-3.586677055760062e-05,-8.874527685659556e-05,-1.422207035900031e-13,-0.0011852523034826,-2.897103251338644e-05,-0.0005324009949074,-0.0465813731203045,-0.0056848806102509,-5.499515586414859,-1.1644024547981994e-13,-0.0037939142034661,-4.339263647740338e-06,-0.0061053347538973,-5.33995870435761e-06,-0.0022183974092494,-1.227336504831118e-06,-3.392131020518718e-14,-1.578846911240598e-06,-0.0066877399853007,-3.570237385817559e-05,-0.0005385523858955,-0.4917065586069845,-9.131917102842217e-14,-7.120277601741411e-06,-4.40864136833651e-06,-0.0002461471052435,-0.0590377857514537],"att":-16.867982533346094,"attScm":-15.68163446071527,"rho":0.3161359065457221,"rhoLo":0.2311558528264131,"rhoHi":0.4032067287061922,"tiles":{"Maine":[0,10],"Vermont":[1,9],"New Hampshire":[1,10],"Washington":[2,0],"Idaho":[2,1],"Montana":[2,2],"North Dakota":[2,3],"Minnesota":[2,4],"Illinois":[2,5],"Wisconsin":[2,6],"Michigan":[2,7],"New York":[2,8],"Rhode Island":[2,9],"Massachusetts":[2,10],"Oregon":[3,0],"Nevada":[3,1],"Wyoming":[3,2],"South Dakota":[3,3],"Iowa":[3,4],"Indiana":[3,5],"Ohio":[3,6],"Pennsylvania":[3,7],"New Jersey":[3,8],"Connecticut":[3,9],"California":[4,0],"Utah":[4,1],"Colorado":[4,2],"Nebraska":[4,3],"Missouri":[4,4],"Kentucky":[4,5],"West Virginia":[4,6],"Virginia":[4,7],"Maryland":[4,8],"Delaware":[4,9],"Arizona":[5,1],"New Mexico":[5,2],"Kansas":[5,3],"Arkansas":[5,4],"Tennessee":[5,5],"North Carolina":[5,6],"South Carolina":[5,7],"Oklahoma":[6,3],"Louisiana":[6,4],"Mississippi":[6,5],"Alabama":[6,6],"Georgia":[6,7],"Texas":[7,3],"Florida":[7,8]},"postal":{"Alabama":"AL","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"}};
  // END GENERATED DATA

  var N = DATA.donors.length;
  var NEVADA = DATA.donors.indexOf('Nevada');
  var MINUS = '−';
  var DEFAULTS = { rho: DATA.rho, xi0: DATA.att, rounds: 0, origin: 'California' };
  var ROUNDS_ALL = 9; // slider position meaning "all rounds: exact solve"

  // ---- numerics (pure) --------------------------------------------------
  function rowNormalised() {
    var Wn = [];
    for (var i = 0; i < N; i++) {
      var row = new Array(N);
      for (var j = 0; j < N; j++) row[j] = 0;
      var nb = DATA.adj[i];
      for (var k = 0; k < nb.length; k++) row[nb[k]] = 1 / nb.length;
      Wn.push(row);
    }
    return Wn;
  }
  var WN = rowNormalised();

  function matVec(A, x) {
    var y = new Array(N);
    for (var i = 0; i < N; i++) {
      var s = 0;
      var r = A[i];
      for (var j = 0; j < N; j++) s += r[j] * x[j];
      y[i] = s;
    }
    return y;
  }

  // Solve (I − rho·Wn) x = b by Gaussian elimination with partial pivoting.
  function solve(rho, b) {
    var M = [];
    for (var i = 0; i < N; i++) {
      var row = new Array(N + 1);
      for (var j = 0; j < N; j++) row[j] = (i === j ? 1 : 0) - rho * WN[i][j];
      row[N] = b[i];
      M.push(row);
    }
    for (var c = 0; c < N; c++) {
      var p = c;
      for (var r = c + 1; r < N; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var tmp = M[c]; M[c] = M[p]; M[p] = tmp;
      for (var r2 = c + 1; r2 < N; r2++) {
        var f = M[r2][c] / M[c][c];
        if (f === 0) continue;
        for (var k = c; k <= N; k++) M[r2][k] -= f * M[c][k];
      }
    }
    var x = new Array(N);
    for (var i2 = N - 1; i2 >= 0; i2--) {
      var s = M[i2][N];
      for (var k2 = i2 + 1; k2 < N; k2++) s -= M[i2][k2] * x[k2];
      x[i2] = s / M[i2][i2];
    }
    return x;
  }

  // Effect on every donor. rounds = 0 means the exact solve.
  function compute(p) {
    var rho = p.rho, xi0 = p.xi0, rounds = p.rounds || 0;
    var origin = p.origin || 'California';
    var j0 = origin === 'California' ? -1 : DATA.donors.indexOf(origin);
    if (origin !== 'California' && j0 < 0) throw new Error('spill-lab: unknown origin ' + origin);
    var seed = new Array(N);
    for (var i = 0; i < N; i++) seed[i] = 0;
    var b;
    if (j0 < 0) {
      seed[NEVADA] = rho * xi0;          // step 1: rho · wn · xi0
      b = seed;
    } else {
      seed[j0] = xi0;                    // step 0: the shock itself
      b = seed;
    }
    var xi;
    if (!rounds) {
      xi = solve(rho, b);
    } else {
      // California: sum_{k=0}^{R−1} (rho Wn)^k b; donor origin: sum_{k=0}^{R} (rho Wn)^k b.
      var terms = j0 < 0 ? rounds : rounds + 1;
      var x = b.slice();
      xi = b.slice();
      for (var t = 1; t < terms; t++) {
        x = matVec(WN, x);
        for (var q = 0; q < N; q++) { x[q] *= rho; xi[q] += x[q]; }
      }
    }
    var total = 0, bias = 0;
    for (var m = 0; m < N; m++) {
      total += xi[m];
      bias -= DATA.alpha[m] * xi[m];
    }
    var out = {
      xi: xi,
      total: total,
      nevada: xi[NEVADA],
      idaho: xi[DATA.donors.indexOf('Idaho')],
      utah: xi[DATA.donors.indexOf('Utah')],
      wyoming: xi[DATA.donors.indexOf('Wyoming')],
      origin: origin
    };
    if (j0 < 0) { out.bias = bias; out.naive = xi0 + bias; }
    return out;
  }

  function ranked(xi, origin) {
    var idx = [];
    for (var i = 0; i < N; i++) if (DATA.donors[i] !== origin) idx.push(i);
    idx.sort(function (a, b) { return Math.abs(xi[b]) - Math.abs(xi[a]); });
    return idx;
  }

  // ---- formatting ----------------------------------------------------------
  function fmt(v, d) {
    if (!isFinite(v)) return 'none';
    var r = Number(v).toFixed(d);
    if (Number(r) === 0) r = Number(0).toFixed(d);
    return r.charAt(0) === '-' ? MINUS + r.slice(1) : r;
  }
  function signed(v, d) {
    var s = fmt(v, d);
    return s.charAt(0) === MINUS || Number(v).toFixed(d) * 1 === 0 ? s : '+' + s;
  }
  function setText(el, t) { if (el && el.textContent !== t) el.textContent = t; }

  // ---- colour scale --------------------------------------------------------
  // Tile fill opacity grows with |effect| relative to the largest |effect|.
  function level(v, vmax) {
    if (!vmax || !isFinite(v)) return 0;
    var a = Math.abs(v) / vmax;
    return Math.sqrt(Math.min(1, a)); // square root keeps the second ring visible
  }

  // ---- widget --------------------------------------------------------------
  var SVGNS = 'http://www.w3.org/2000/svg';

  function Lab(root) {
    this.root = root;
    this.p = { rho: DEFAULTS.rho, xi0: DEFAULTS.xi0, rounds: 0, origin: DEFAULTS.origin };
    this.q = function (sel) { return root.querySelector(sel); };
    this.inRho = this.q('[data-param="rho"]');
    this.inXi = this.q('[data-param="xi0"]');
    this.inRounds = this.q('[data-param="rounds"]');
    this.inOrigin = this.q('[data-param="origin"]');
    this.status = this.q('[data-out="status"]');
    this.live = this.q('[data-live="live"]');
    this.map = this.q('[data-map="map"]');
    this.top = this.q('[data-out="top"]');
    if (!this.inRho || !this.inXi || !this.inRounds || !this.inOrigin || !this.map || !this.top) {
      throw new Error('spill-lab: markup incomplete');
    }
    this.buildOrigins();
    this.buildMap();
    this.bind();
    this.syncInputs();
    this.render();
    root.setAttribute('data-ready', 'true');
  }

  Lab.prototype.buildOrigins = function () {
    var sel = this.inOrigin;
    while (sel.firstChild) sel.removeChild(sel.firstChild);
    var names = ['California'].concat(DATA.donors.slice().sort());
    for (var i = 0; i < names.length; i++) {
      var o = document.createElement('option');
      o.value = names[i];
      o.textContent = names[i] === 'California' ? 'California (the treated state)' : names[i];
      sel.appendChild(o);
    }
  };

  Lab.prototype.buildMap = function () {
    var g = this.map;
    var CELL = 34, GAP = 3;
    this.tiles = {};
    var names = Object.keys(DATA.tiles);
    for (var i = 0; i < names.length; i++) {
      var s = names[i];
      var rc = DATA.tiles[s];
      var x = 4 + rc[1] * CELL, y = 4 + rc[0] * CELL;
      var grp = document.createElementNS(SVGNS, 'g');
      var inPanel = s === 'California' || DATA.donors.indexOf(s) >= 0;
      grp.setAttribute('class', 'xl-tile' + (inPanel ? '' : ' xl-tile-out'));
      grp.setAttribute('data-tile', DATA.postal[s]);
      var base = document.createElementNS(SVGNS, 'rect');
      base.setAttribute('class', 'xl-tile-base');
      base.setAttribute('x', x); base.setAttribute('y', y);
      base.setAttribute('width', CELL - GAP); base.setAttribute('height', CELL - GAP);
      base.setAttribute('rx', '4');
      var fill = document.createElementNS(SVGNS, 'rect');
      fill.setAttribute('class', 'xl-tile-fill');
      fill.setAttribute('x', x); fill.setAttribute('y', y);
      fill.setAttribute('width', CELL - GAP); fill.setAttribute('height', CELL - GAP);
      fill.setAttribute('rx', '4');
      fill.setAttribute('fill-opacity', '0');
      var t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('x', x + (CELL - GAP) / 2);
      t.setAttribute('y', y + (CELL - GAP) / 2 + 3.5);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('class', 'xl-tile-lab');
      t.textContent = DATA.postal[s];
      var title = document.createElementNS(SVGNS, 'title');
      title.textContent = s;
      grp.appendChild(title);
      grp.appendChild(base);
      grp.appendChild(fill);
      grp.appendChild(t);
      g.appendChild(grp);
      this.tiles[s] = { g: grp, fill: fill, title: title };
    }
  };

  Lab.prototype.bind = function () {
    var self = this;
    function onInput() { self.read(); self.render(); }
    function onChange() { self.read(); self.render(); self.announce(); }
    var ins = [this.inRho, this.inXi, this.inRounds];
    for (var i = 0; i < ins.length; i++) {
      ins[i].addEventListener('input', onInput);
      ins[i].addEventListener('change', onChange);
    }
    this.inOrigin.addEventListener('change', onChange);
    var reset = this.q('[data-act="reset"]');
    if (reset) reset.addEventListener('click', function () { self.reset(); });
  };

  Lab.prototype.read = function () {
    var r = parseFloat(this.inRho.value);
    var x = parseFloat(this.inXi.value);
    var k = parseInt(this.inRounds.value, 10);
    // Keep the exact posterior values while the slider still sits on them.
    this.p.rho = Math.abs(r - Number(DATA.rho.toFixed(3))) < 1e-9 ? DATA.rho : r;
    this.p.xi0 = Math.abs(x - Number(DATA.att.toFixed(1))) < 1e-9 ? DATA.att : x;
    this.p.rounds = k >= ROUNDS_ALL ? 0 : k;
    this.p.origin = this.inOrigin.value || 'California';
  };

  Lab.prototype.syncInputs = function () {
    this.inRho.value = this.p.rho.toFixed(3);
    this.inXi.value = this.p.xi0.toFixed(1);
    this.inRounds.value = this.p.rounds ? String(this.p.rounds) : String(ROUNDS_ALL);
    this.inOrigin.value = this.p.origin;
  };

  Lab.prototype.reset = function () {
    this.p = { rho: DEFAULTS.rho, xi0: DEFAULTS.xi0, rounds: 0, origin: DEFAULTS.origin };
    this.syncInputs();
    this.render();
    this.announce();
  };

  Lab.prototype.isDefault = function () {
    return this.p.rho === DATA.rho && this.p.xi0 === DATA.att && !this.p.rounds &&
      this.p.origin === 'California';
  };

  Lab.prototype.render = function () {
    var p = this.p, res = compute(p);
    this.res = res;
    var ca = p.origin === 'California';
    setText(this.q('[data-param-out="rho"]'), fmt(p.rho, 3));
    setText(this.q('[data-param-out="xi0"]'), fmt(p.xi0, 2));
    setText(this.q('[data-param-out="rounds"]'), p.rounds ? String(p.rounds) : 'all (exact)');
    setText(this.status, this.isDefault() ? 'Plug-in values at the posterior means' : 'Modified');

    // map
    var vmax = 0;
    for (var i = 0; i < N; i++) vmax = Math.max(vmax, Math.abs(res.xi[i]));
    var names = Object.keys(this.tiles);
    for (var n = 0; n < names.length; n++) {
      var s = names[n], tile = this.tiles[s];
      var j = DATA.donors.indexOf(s);
      var cls = 'xl-tile';
      if (s === 'California') cls += ca ? ' xl-tile-origin' : ' xl-tile-ca';
      else if (j < 0) cls += ' xl-tile-out';
      else if (s === p.origin) cls += ' xl-tile-origin';
      tile.g.setAttribute('class', cls);
      var v = j >= 0 ? res.xi[j] : NaN;
      tile.fill.setAttribute('fill-opacity', j >= 0 ? level(v, vmax).toFixed(3) : '0');
      tile.title.textContent = j >= 0 ? s + ': ' + fmt(v, 3) + ' packs' :
        (s === 'California' ? 'California, the treated state' : s + ', not in the panel');
    }

    // largest recipients
    var order = ranked(res.xi, p.origin).slice(0, 5);
    var items = this.top.querySelectorAll('li');
    for (var t = 0; t < 5; t++) {
      var k = order[t];
      setText(items[t], DATA.donors[k] + ': ' + fmt(res.xi[k], 3));
    }

    // readouts
    setText(this.q('[data-out="nevada"]'), fmt(res.nevada, 3));
    setText(this.q('[data-out="ring2"]'), fmt(res.idaho, 3) + ' and ' + fmt(res.utah, 3));
    setText(this.q('[data-out="total"]'), fmt(res.total, 3));
    var share = res.total !== 0 ? Math.abs(res.xi[order[0]]) / Math.abs(res.total) : NaN;
    setText(this.q('[data-out="share"]'), isFinite(share) ?
      (100 * share).toFixed(0) + '% (' + DATA.donors[order[0]] + ')' : 'none');
    setText(this.q('[data-out="bias"]'), ca ? signed(res.bias, 3) : 'applies to California only');
    setText(this.q('[data-out="naive"]'), ca ? fmt(res.naive, 3) : 'applies to California only');
    var pm = DATA.postMean[NEVADA];
    setText(this.q('[data-out="postmean"]'), fmt(pm, 3));
    var flag = this.q('[data-out="flag"]');
    if (flag) {
      var txt;
      if (!ca) txt = 'A shock to ' + p.origin + ' spreads through the same contiguity graph; the bias readout needs California as the origin.';
      else if (p.rho < DATA.rhoLo || p.rho > DATA.rhoHi) txt = 'This rho lies outside the 95% credible interval (' + fmt(DATA.rhoLo, 3) + ' to ' + fmt(DATA.rhoHi, 3) + ').';
      else txt = 'This rho lies inside the 95% credible interval (' + fmt(DATA.rhoLo, 3) + ' to ' + fmt(DATA.rhoHi, 3) + ').';
      setText(flag, txt);
    }
  };

  Lab.prototype.announce = function () {
    var self = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(function () {
      if (!self.live || !self.res) return;
      var r = self.res, ca = self.p.origin === 'California';
      var txt = 'rho ' + fmt(self.p.rho, 3) + ', effect at origin ' + fmt(self.p.xi0, 2) +
        ', ' + (self.p.rounds ? self.p.rounds + ' rounds' : 'all rounds') + '. Nevada ' +
        fmt(r.nevada, 3) + ', total spillover ' + fmt(r.total, 3) +
        (ca ? ', bias ' + signed(r.bias, 3) + ', naive estimate ' + fmt(r.naive, 3) + '.' : '.');
      self.live.textContent = txt;
    }, 300);
  };

  function initAll() {
    var els = document.querySelectorAll('.spill-lab[data-spill-lab]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].hasAttribute('data-ready') || els[i]._spillLab) continue;
      try {
        els[i]._spillLab = new Lab(els[i]);
      } catch (e) {
        if (G.console) G.console.error('spill-lab: could not start', els[i].id, e);
      }
    }
  }

  G.SpillLab = {
    __loaded: true,
    DATA: DATA,
    DEFAULTS: DEFAULTS,
    compute: compute,
    solve: solve,
    ranked: ranked,
    fmt: fmt,
    init: initAll
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();
  }
})();
