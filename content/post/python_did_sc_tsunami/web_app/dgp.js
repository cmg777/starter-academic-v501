// dgp.js — seeded RNG + a difference-in-differences panel simulator for the
// Aceh tsunami interactive lab. No external data; everything is generated in
// the browser so the DGP-simulator tab teaches small-N fragility live.
//
// Exposed as window.DGP.{mulberry32, makeNormal, simulate_did, periodOf}.

(function () {
  "use strict";

  // Mulberry32 — small, fast, seeded PRNG. Returns a function () -> [0, 1).
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Box–Muller (polar) standard-normal generator from a [0,1) rng.
  function makeNormal(rng) {
    let spare = null;
    return function () {
      if (spare !== null) {
        const s = spare;
        spare = null;
        return s;
      }
      let u, v, s;
      do {
        u = 2 * rng() - 1;
        v = 2 * rng() - 1;
        s = u * u + v * v;
      } while (s >= 1 || s === 0);
      const m = Math.sqrt((-2 * Math.log(s)) / s);
      spare = v * m;
      return u * m;
    };
  }

  // Map a calendar year to the paper's event-time period.
  function periodOf(year) {
    if (year <= 2002) return "baseline"; // 2000–02, the omitted reference
    if (year <= 2004) return "pre"; // 2003–04 (parallel-trends check)
    if (year === 2005) return "tsunami"; // the shock
    if (year <= 2008) return "recovery"; // 2006–08 reconstruction boom
    return "post"; // 2009–12
  }

  const YEARS = [];
  for (let y = 2000; y <= 2012; y++) YEARS.push(y);

  // Simulate a district×year panel of GDP growth and return the dynamic-DiD
  // period coefficients (treated change − control change, relative to the
  // 2000–02 baseline). The treated increments default to the paper's pattern;
  // the sliders move the 2005 shock and the recovery boom.
  function simulate_did(opts) {
    const nT = Math.max(1, opts.nTreated | 0);
    const nC = Math.max(1, opts.nControl | 0);
    const incr = {
      baseline: 0,
      pre: 0.017,
      tsunami: opts.shock,
      recovery: opts.recovery,
      post: 0.011,
    };
    const rng = mulberry32(opts.seed || 1);
    const randn = makeNormal(rng);

    // Common national year shocks (differenced out by the DiD, but they add
    // realistic co-movement). Treated/control share them.
    const yearFE = {};
    YEARS.forEach((y) => {
      yearFE[y] = 0.05 + 0.01 * randn();
    });

    const sum = {};
    const cnt = {};
    const groups = ["T", "C"];
    const periods = ["baseline", "pre", "tsunami", "recovery", "post"];
    groups.forEach((g) =>
      periods.forEach((p) => {
        sum[g + p] = 0;
        cnt[g + p] = 0;
      })
    );

    function addUnit(isT) {
      for (let k = 0; k < YEARS.length; k++) {
        const y = YEARS[k];
        const p = periodOf(y);
        let g = yearFE[y] + opts.noise * randn();
        if (isT) g += incr[p];
        const key = (isT ? "T" : "C") + p;
        sum[key] += g;
        cnt[key] += 1;
      }
    }
    for (let i = 0; i < nT; i++) addUnit(true);
    for (let i = 0; i < nC; i++) addUnit(false);

    const mean = (g, p) => sum[g + p] / cnt[g + p];
    const did = (p) =>
      mean("T", p) - mean("T", "baseline") - (mean("C", p) - mean("C", "baseline"));

    return {
      pre: did("pre"),
      tsunami: did("tsunami"),
      recovery: did("recovery"),
      post: did("post"),
    };
  }

  window.DGP = { mulberry32, makeNormal, simulate_did, periodOf, YEARS };
})();
