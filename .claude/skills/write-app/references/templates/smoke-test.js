// smoke-test.js — runs under Node to verify a generated web_app/ bundle.
//
// Usage:
//   BASE=/path/to/content/post/<slug>/web_app node smoke-test.js
//
// Loads dgp.js + lasso.js into an isolated vm context, then runs sanity
// assertions. Exits 0 on success, 1 on any failure. Prints a [✓]/[✗]
// line per assertion so Phase 4 can capture the report.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const BASE = process.env.BASE;
if (!BASE) {
  console.error("smoke-test.js: BASE env variable required");
  process.exit(2);
}

const ctx = { window: {}, console };
vm.createContext(ctx);

function load(name) {
  const code = fs.readFileSync(path.join(BASE, name), "utf8");
  vm.runInContext(code, ctx, { filename: name });
}

try {
  load("dgp.js");
  load("lasso.js");
} catch (err) {
  console.error("[✗] failed to load JS module:", err.message);
  process.exit(1);
}

const { DGP, LASSO } = ctx.window;
const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || "" });
}

// 1. qnorm precision
check("qnorm(0.975) ≈ 1.96",   Math.abs(LASSO.qnorm(0.975)   - 1.95996) < 0.001,
      `got ${LASSO.qnorm(0.975).toFixed(4)}`);
check("qnorm(0.99975) ≈ 3.48", Math.abs(LASSO.qnorm(0.99975) - 3.48075) < 0.001,
      `got ${LASSO.qnorm(0.99975).toFixed(4)}`);

// 2. DGP shape
const sim = DGP.simulate_lasso({ n: 200, p: 20, signal: 0.7, seed: 42 });
check("simulate_lasso returns y of length n", sim.y.length === sim.n,
      `expected ${sim.n}, got ${sim.y.length}`);
check("simulate_lasso returns X of length n*p", sim.X.length === sim.n * sim.p,
      `expected ${sim.n * sim.p}, got ${sim.X.length}`);

// 3. lambda_max bound: at lambda > lambda_max, all coefs are zero
const lmax = LASSO.lambda_max(sim.X, sim.y, sim.n, sim.p);
const fit_big = LASSO.lasso_one(sim.X, sim.y, sim.n, sim.p, lmax * 1.01, null, null);
let nz_big = 0;
for (let j = 0; j < sim.p; j++) if (Math.abs(fit_big.b[j]) > 1e-9) nz_big++;
check("at λ > λ_max all coefficients are zero", nz_big === 0,
      `nonzero count = ${nz_big}`);

// 4. OLS recovery: at lambda ~ 0, all coefs nonzero (recovers OLS)
const fit_small = LASSO.lasso_one(sim.X, sim.y, sim.n, sim.p, lmax * 1e-4, null, null,
                                  { maxIter: 300, tol: 1e-9 });
let nz_small = 0;
for (let j = 0; j < sim.p; j++) if (Math.abs(fit_small.b[j]) > 1e-6) nz_small++;
check("at λ → 0 all coefficients are nonzero (OLS recovery)",
      nz_small >= sim.p * 0.95,
      `nonzero count = ${nz_small} of ${sim.p}`);

// 5. Performance: lasso_path at the caps should finish under 300 ms
const t0 = Date.now();
const big = DGP.simulate_lasso({ n: 500, p: 100, signal: 0.6, seed: 1 });
LASSO.lasso_path(big.X, big.y, big.n, big.p, { nLam: 80, maxIter: 60, tol: 1e-5 });
const dt = Date.now() - t0;
check("lasso_path(n=500, p=100) < 300 ms (warn if slower)",
      dt < 300,
      `${dt} ms`);

// 6. (Optional) Pattern-A: results.json exists and has expected schema.
const resultsPath = path.join(BASE, "data", "results.json");
if (fs.existsSync(resultsPath)) {
  try {
    const r = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
    const hasEstimates = Array.isArray(r.estimates);
    const validRow = !hasEstimates || r.estimates.length === 0 ||
      (typeof r.estimates[0].method === "string" &&
       typeof r.estimates[0].estimate === "number");
    check("data/results.json has the expected schema",
          hasEstimates && validRow,
          hasEstimates ? `${r.estimates.length} rows` : "missing 'estimates' array");
  } catch (e) {
    check("data/results.json parses as JSON", false, e.message);
  }
}

// Report
let failed = 0;
for (const r of results) {
  const mark = r.ok ? "[✓]" : "[✗]";
  console.log(`${mark} ${r.name}${r.detail ? "  (" + r.detail + ")" : ""}`);
  if (!r.ok) failed++;
}
console.log(`\n${results.length - failed} of ${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
