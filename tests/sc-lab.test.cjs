// Numerical checks for the synthetic control lab (assets/js/sc-lab.js).
// Run with `node --test tests/sc-lab.test.cjs` from the repository root. Set the
// environment variable SC_LAB_JS to test another copy of the script, such as the
// minified bundle of a Hugo build. Every expected value comes from
// content/tutorials/python_sc101/sc101_results.json, written by script.py; numbers
// must agree to 1e-9 (relative to the size of the number when it exceeds one).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FILE = process.env.SC_LAB_JS ? path.resolve(process.env.SC_LAB_JS) : path.join(ROOT, 'assets/js/sc-lab.js');
const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/tutorials/python_sc101/sc101_results.json'), 'utf8'));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(FILE, 'utf8'), context, { filename: FILE });
const L = context.window.ScLab;
const TOL = 1e-9;
const MINUS = '−';

function near(actual, expected, label, tol = TOL) {
  const ok = Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected));
  assert.ok(ok, `${label}: ${actual} differs from ${expected}`);
}
function nearAll(actual, expected, label) {
  assert.equal(actual.length, expected.length, `${label}: length`);
  expected.forEach((v, i) => near(actual[i], v, `${label}[${i}]`));
}
function positive(list) {
  return Object.fromEntries(list.map(([name, w]) => [name, w]));
}
const preset = (key) => R.lab_scenarios.mixer.presets.find((p) => p.key === key);

test('the script loads as a pure module and exposes the API', () => {
  assert.ok(L && L.__loaded, 'window.ScLab is missing');
  assert.equal(L.STATES.length, 39);
  assert.deepEqual([...L.STATES], R.states);
  assert.equal(L.STATES[L.CA], 'California');
  assert.equal(L.YEAR0, R.meta.first_year);
  assert.equal(L.T0, R.meta.t0);
  assert.deepEqual([...L.CUT_STOPS], R.lab_scenarios.cutoff.values);
  assert.equal(L.CUT_DEFAULT, R.lab_scenarios.cutoff.default);
  assert.deepEqual([...L.FAKE_YEARS], R.intime.fake_years);
  assert.equal(L.FAKE_DEFAULT, R.intime.default);
  assert.deepEqual([...L.LOO_ORDER], R.loo.dropped);
});

test('decoded sales equal the sales of sc101_results.json exactly', () => {
  R.cigsale.forEach((rowValues, s) => rowValues.forEach((v, t) => {
    assert.equal(L.y(s, t), v, `${R.states[s]} ${R.years[t]}`);
  }));
});

test('every stored fit is rebuilt from its weights, with no embedded gap', () => {
  assert.deepEqual(Object.keys(L.GAP_OVERRIDES), []);
});

test('the mlsynth preset reproduces the baseline of the post', () => {
  const m = L.mixer(L.presetWeights('mlsynth'));
  near(m.att, R.baseline.att, 'ATT');
  near(m.preRMSPE, R.baseline.pre_rmse, 'pre-period RMSPE');
  near(m.gap2000, R.baseline.gap_2000, 'gap in 2000');
  near(m.preMSPE, R.baseline.pre_mspe, 'pre-period MSPE');
  near(m.postMSPE, R.baseline.post_mspe, 'post-period MSPE');
  near(m.ratio, R.baseline.mspe_ratio, 'MSPE ratio');
  near(m.rmspeRatio, R.baseline.rmspe_ratio, 'RMSPE ratio');
  nearAll(m.gap, R.baseline.gap, 'gap path');
  nearAll(m.synthetic, R.baseline.synthetic, 'synthetic path');
  nearAll(L.mixer(L.presetWeights('avg38')).synthetic, R.baseline.donor_average_path, 'donor average path');
});

test('the Stata preset reproduces the recomputation with the rounded Stata weights', () => {
  const m = L.mixer(L.presetWeights('stata'));
  near(m.att, -19.001766410191856, 'ATT');
  near(m.att, R.baseline.stata_w.att, 'ATT');
  near(m.preRMSPE, R.baseline.stata_w.pre_rmse, 'pre-period RMSPE');
  nearAll(m.gap, R.baseline.stata_w.gap, 'gap path');
  nearAll(m.synthetic, R.baseline.stata_w.synthetic, 'synthetic path');
});

test('the outcome-only preset reproduces the outcome-only fit', () => {
  const m = L.mixer(L.presetWeights('outcome'));
  const p = preset('outcome');
  near(m.att, p.att, 'ATT');
  near(m.preRMSPE, p.pre_rmspe, 'pre-period RMSPE');
  near(m.gap2000, p.gap_2000, 'gap in 2000');
  const tour = R.tour.find((t) => t.key === 'vanillasc_outcome');
  nearAll(m.synthetic.map((v) => Math.round(v * 1e10) / 1e10), tour.counterfactual, 'synthetic path, ten decimals');
});

test('every mixer scenario of lab_scenarios is reproduced', () => {
  const states = R.states;
  const shares = {
    mlsynth: () => L.presetWeights('mlsynth'),
    stata: () => L.presetWeights('stata'),
    outcome: () => L.presetWeights('outcome'),
    equal_five: () => L.presetWeights('equal_five'),
    utah_only: () => L.presetWeights('utah_only'),
    avg38: () => L.presetWeights('avg38'),
    // Reached with the sliders: Montana alone, then Utah moved to zero from the mlsynth preset.
    montana_only: () => { const s = new Array(39).fill(0); s[states.indexOf('Montana')] = 0.5; return s; },
    utah_zero: () => { const s = L.presetWeights('mlsynth'); s[states.indexOf('Utah')] = 0; return s; }
  };
  assert.deepEqual(R.lab_scenarios.mixer.presets.map((p) => p.key).sort(), Object.keys(shares).sort());
  for (const p of R.lab_scenarios.mixer.presets) {
    const m = L.mixShares(shares[p.key]());
    nearAll(m.weights, p.weights, `${p.key} weights`);
    near(m.preRMSPE, p.pre_rmspe, `${p.key} pre-period RMSPE`);
    near(m.att, p.att, `${p.key} ATT`);
    near(m.gap2000, p.gap_2000, `${p.key} gap in 2000`);
    near(m.ratio, p.ratio, `${p.key} ratio`);
    near(m.rmspeRatio, p.rmspe_ratio, `${p.key} RMSPE ratio`);
  }
  assert.equal(L.mixShares(new Array(39).fill(0)), null, 'all shares zero');
});

test('each placebo unit reproduces its pre- and post-period MSPE, ratio, and rank', () => {
  const units = L.placeboUnits();
  R.placebo.units.forEach((u, i) => {
    assert.equal(units[i].state, u.state);
    near(units[i].preMSPE, u.pre_mspe, `${u.state} pre-period MSPE`);
    near(units[i].postMSPE, u.post_mspe, `${u.state} post-period MSPE`);
    near(units[i].ratio, u.ratio, `${u.state} ratio`);
    near(units[i].preRel, u.pre_rel, `${u.state} pre_rel`);
    nearAll(units[i].gap, u.gap, `${u.state} gap path`);
    const rank = 1 + units.filter((v) => v.ratio > units[i].ratio).length;
    assert.equal(rank, u.rank, `${u.state} rank`);
  });
  near(units[L.CA].ratio, R.placebo.ratio_ca, 'ratio of California');
});

test('every cutoff stop reproduces N, rank, p, the excluded states, and the pointwise counts', () => {
  for (const c of R.lab_scenarios.cutoff.results) {
    const r = L.placebo(c.cutoff);
    const label = `cutoff ${c.label}`;
    assert.equal(r.n, c.n_kept, `${label}: N`);
    assert.equal(r.rank, c.rank, `${label}: rank`);
    near(r.p, c.p, `${label}: p`);
    assert.deepEqual([...r.excluded], c.excluded, `${label}: excluded states`);
    assert.equal(r.nLeftMin, c.n_left_min, `${label}: years at the smallest left-sided p`);
    assert.deepEqual([...r.leftMinYears], c.left_min_years, `${label}: years`);
    for (const side of ['two', 'right', 'left']) {
      const counts = c.pointwise[side].map((p) => Math.round(p * c.n_kept));
      assert.deepEqual([...r.counts[side]], counts, `${label}: ${side}-sided counts`);
      nearAll(r[side], c.pointwise[side], `${label}: ${side}-sided p`);
    }
  }
  const def = L.placebo(L.CUT_DEFAULT);
  assert.equal(def.n, R.placebo.n_kept);
  near(def.p, R.placebo.p_cut, 'p at the default cutoff');
  near(L.placebo(null).p, R.placebo.p_all, 'p without a cutoff');
  const pw = R.pointwise;
  nearAll(def.left, pw.left, 'left-sided p at cut 2');
  nearAll(def.two, pw.two, 'two-sided p at cut 2');
  nearAll(def.right, pw.right, 'right-sided p at cut 2');
  assert.equal(def.nLeftMin, pw.n_left_min);
});

test('the in-time fits for 1985 to 1988 reproduce the post', () => {
  R.intime.fits.forEach((f, i) => {
    const r = L.intime(f.fake_year);
    const s = R.lab_scenarios.intime.results[i];
    near(r.preRMSPE, f.pre_rmspe, `${f.fake_year} pre-period RMSPE`);
    nearAll(r.fakeGaps, f.fake_gaps, `${f.fake_year} fake gaps`);
    near(r.fakeGapMean, f.fake_gap_mean, `${f.fake_year} mean fake gap`);
    near(r.postGapMean, f.post_gap_mean, `${f.fake_year} mean gap 1989 to 2000`);
    nearAll(r.gap, f.gap, `${f.fake_year} gap path`);
    nearAll(r.synthetic, f.synthetic, `${f.fake_year} synthetic path`);
    assert.equal(s.fake_year, f.fake_year);
    assert.deepEqual(Object.keys(positive(r.positive)), Object.keys(s.positive_weights));
    for (const [name, w] of Object.entries(s.positive_weights)) near(positive(r.positive)[name], w, `${f.fake_year} weight of ${name}`);
  });
  const text = L.text.intime(L.intime(1985));
  assert.equal(text.fake, ['3.31', '3.57', '8.64', '8.37'].map((v) => MINUS + v).join(', '));
  assert.equal(text.fakeMean, MINUS + '5.97');
  assert.equal(text.pre, '0.907');
});

test('the leave-one-out refits and their band reproduce the post', () => {
  const band = L.looBand();
  R.loo.fits.forEach((f, i) => {
    const r = L.loo(f.dropped);
    const s = R.lab_scenarios.loo.results[i];
    near(r.att, f.att, `${f.dropped} ATT`);
    near(r.gap2000, f.gap_2000, `${f.dropped} gap in 2000`);
    near(r.gap1997, f.gap_1997, `${f.dropped} gap in 1997`);
    near(r.preRMSE, f.pre_rmse, `${f.dropped} pre-period RMSPE`);
    nearAll(r.gap, f.gap, `${f.dropped} gap path`);
    assert.equal(s.dropped, f.dropped);
    assert.deepEqual(Object.keys(positive(r.positive)), Object.keys(s.positive_weights));
    for (const [name, w] of Object.entries(s.positive_weights)) near(positive(r.positive)[name], w, `${f.dropped} weight of ${name}`);
  });
  nearAll(band.gap2000Range, R.loo.gap_2000_range, 'range of the gap in 2000');
  nearAll(band.attRange, R.loo.att_range, 'range of the ATT');
  assert.equal(band.minGap2000State, R.loo.min_gap_2000_state);
  assert.equal(band.maxGap2000State, R.loo.max_gap_2000_state);
  assert.equal(band.minAttState, R.loo.min_att_state);
  assert.equal(band.maxAttState, R.loo.max_att_state);
  const t0 = R.meta.t0;
  const lo = R.years.slice(t0).map((_, k) => Math.min(...R.loo.fits.map((f) => f.gap[t0 + k])));
  const hi = R.years.slice(t0).map((_, k) => Math.max(...R.loo.fits.map((f) => f.gap[t0 + k])));
  nearAll(band.lo, lo, 'lower edge of the band');
  nearAll(band.hi, hi, 'upper edge of the band');
  const base = L.loo('none');
  near(base.att, R.baseline.att, 'baseline ATT');
});

test('the formatters use a Unicode minus and the one table of decimals', () => {
  assert.equal(L.fmt(-18.9816, 2), '−18.98');
  assert.equal(L.fmt(-18.9816, 2), MINUS + '18.98');
  assert.equal(L.fmt(-0.0001, 2), '0.00');
  assert.equal(L.fmt(0.05, 3), '0.050');
  assert.equal(L.fmt(129.04333, 1), '129.0');
  assert.deepEqual({ ...L.DP }, { att: 2, gap: 2, rmspe: 3, p: 3, ratio: 1, weight: 3 });
});

test('the default readouts show the strings of the post', () => {
  const mx = L.text.mixer(L.mixer(L.presetWeights('mlsynth')));
  assert.deepEqual({ ...mx }, { pre: '1.754', att: MINUS + '18.98', gap2000: MINUS + '25.73', ratio: '129.0' });
  const ct = L.text.cutoff(L.placebo(L.CUT_DEFAULT), 2000);
  assert.equal(ct.kept, '20 of 39');
  assert.equal(ct.rank, '1 of 20');
  assert.equal(ct.p, '0.050');
  assert.equal(ct.minP, '0.050');
  assert.equal(ct.two, '0.050');
  assert.equal(ct.right, '1.000');
  assert.equal(ct.left, '0.050');
  assert.equal(ct.leftMin, '9 of 12');
  assert.equal(ct.excludedCount, '19');
  assert.equal(L.text.cutoff(L.placebo(null), 2000).p, '0.026');
  assert.equal(L.text.cutoff(L.placebo(5), 2000).p, '0.032');
  const lo = L.text.loo(L.loo('none'), L.looBand());
  assert.equal(lo.attRange, MINUS + '19.29 to ' + MINUS + '17.52');
  assert.equal(lo.gapRange, MINUS + '27.15 to ' + MINUS + '23.48');
  assert.equal(L.text.intime(L.intime(1985)).weights, 'Utah 0.351, Connecticut 0.348, Nevada 0.301');
});
