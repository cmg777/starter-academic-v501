// Numerical checks for the ripple lab (assets/js/spill-lab.js).
// Run with `node --test tests/spill-lab.test.cjs` from the repository root. Set
// SPILL_LAB_JS to test another copy of the script, such as the minified bundle
// of a Hugo build. Expected values come from tests/spill-lab.reference.json,
// written by content/tutorials/python_sc_bayes_spatial/build_spill_lab_data.py
// with numpy; numbers must agree to 1e-9.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FILE = process.env.SPILL_LAB_JS ? path.resolve(process.env.SPILL_LAB_JS) : path.join(ROOT, 'assets/js/spill-lab.js');
const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'spill-lab.reference.json'), 'utf8'));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(FILE, 'utf8'), context, { filename: FILE });
const L = context.window.SpillLab;
const TOL = 1e-9;

function near(actual, expected, label) {
  const ok = Math.abs(actual - expected) <= TOL * Math.max(1, Math.abs(expected));
  assert.ok(ok, `${label}: ${actual} differs from ${expected}`);
}

test('the script loads as a pure module with its generated data', () => {
  assert.ok(L && L.__loaded, 'window.SpillLab is missing');
  assert.equal(L.DATA.donors.length, 38);
  assert.equal(L.DATA.alpha.length, 38);
  assert.ok(L.DATA.donors.includes('Nevada'));
  assert.ok(!L.DATA.donors.includes('California'));
  // contiguity lists are symmetric
  L.DATA.adj.forEach((nb, i) => nb.forEach((j) => assert.ok(L.DATA.adj[j].includes(i), `${i}-${j}`)));
  // every donor and California has a tile
  ['California', ...L.DATA.donors].forEach((s) => assert.ok(L.DATA.tiles[s], `tile for ${s}`));
});

test('the defaults are the posterior means of the post', () => {
  near(L.DEFAULTS.rho, REF[0].rho, 'rho');
  near(L.DEFAULTS.xi0, REF[0].xi0, 'xi0');
  assert.equal(L.DEFAULTS.origin, 'California');
});

REF.forEach((c, k) => {
  test(`case ${k}: rho ${c.rho.toFixed(4)}, xi0 ${c.xi0.toFixed(3)}, rounds ${c.rounds === null ? 'all' : c.rounds}`, () => {
    const r = L.compute({ rho: c.rho, xi0: c.xi0, rounds: c.rounds || 0, origin: 'California' });
    for (const key of ['nevada', 'idaho', 'utah', 'wyoming', 'total', 'bias', 'naive']) {
      near(r[key], c[key], key);
    }
  });
});

test('one round moves only Nevada, by exactly rho times the effect', () => {
  const r = L.compute({ rho: 0.3, xi0: -10, rounds: 1, origin: 'California' });
  near(r.nevada, -3, 'nevada');
  r.xi.forEach((v, i) => { if (L.DATA.donors[i] !== 'Nevada') assert.equal(v, 0); });
});

test('rho = 0 removes every spillover and the bias', () => {
  const r = L.compute({ rho: 0, xi0: L.DATA.att, rounds: 0, origin: 'California' });
  r.xi.forEach((v) => assert.ok(v === 0, 'zero spillover'));
  near(r.bias, 0, 'bias');
});

test('a donor origin keeps the shock at the origin and has no bias readout', () => {
  const r = L.compute({ rho: 0.3, xi0: -10, rounds: 0, origin: 'Missouri' });
  const j = L.DATA.donors.indexOf('Missouri');
  assert.ok(r.xi[j] <= -10, 'origin carries at least the shock');
  assert.equal(r.bias, undefined);
  const top = L.ranked(r.xi, 'Missouri');
  assert.ok(!top.includes(j), 'origin is excluded from the ranking');
  L.DATA.adj[j].forEach((n) => assert.ok(r.xi[n] < 0, `${L.DATA.donors[n]} moves`));
});

test('the truncated ripple converges to the exact solve', () => {
  const exact = L.compute({ rho: L.DATA.rho, xi0: L.DATA.att, rounds: 0, origin: 'California' });
  const deep = L.compute({ rho: L.DATA.rho, xi0: L.DATA.att, rounds: 60, origin: 'California' });
  exact.xi.forEach((v, i) => near(deep.xi[i], v, `donor ${i}`));
});

test('formatting uses a true minus sign and never a dollar sign', () => {
  assert.equal(L.fmt(-5.4838, 3), '−5.484');
  assert.equal(L.fmt(0.0001, 2), '0.00');
  if (!process.env.SPILL_LAB_JS) assert.ok(!fs.readFileSync(FILE, 'utf8').includes('$'));
});
