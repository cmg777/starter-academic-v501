// dgp.js — seeded RNG + a staggered difference-in-differences event-study
// simulator for the Ethiopian industrial-parks interactive lab. No external
// data: the simulator generates a woreda×year panel in the browser so the
// event-study tab can teach pre-trend / dynamic-effect / small-N noise live.
//
// Exposed as window.DGP.{mulberry32, makeNormal, simulate_event_study}.

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

  // Event time k ∈ [-5, +5]. The "true" dynamic path is the post's calibrated
  // shape: flat leads, a jump at k=0 that ramps to a ~0.48 plateau by k=4-5.
  // The amplitude argument scales the post-period; pretrend injects a slope on
  // the leads so users can break parallel trends.
  const KS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  function truePath(amplitude, pretrend) {
    // Calibrated to event_study_light.csv (with amplitude = 1).
    const base = {
      "-5": 0.0, "-4": 0.0, "-3": 0.0, "-2": 0.0, "-1": 0.0,
      "0": 0.1153, "1": 0.1928, "2": 0.2187, "3": 0.3138, "4": 0.4844, "5": 0.4697,
    };
    const out = {};
    KS.forEach((k) => {
      let v = base[String(k)] * amplitude;
      if (k < -1) v += pretrend * (k + 1); // inject a pre-trend slope on the leads
      out[k] = v;
    });
    return out;
  }

  // Simulate a balanced woreda×year staggered panel, estimate the event-study
  // coefficients by a group-mean dynamic DiD (treated change − control change,
  // relative to the k=-1 reference), and return { ks, estimate, true }.
  // nTreated drives the small-N noise that the real 17-cluster study suffers.
  function simulate_event_study(opts) {
    const nT = Math.max(1, opts.nTreated | 0);
    const nC = Math.max(1, opts.nControl | 0);
    const amplitude = opts.amplitude != null ? opts.amplitude : 1;
    const pretrend = opts.pretrend != null ? opts.pretrend : 0;
    const noise = opts.noise != null ? opts.noise : 0.06;
    const truth = truePath(amplitude, pretrend);

    const rng = mulberry32(opts.seed || 1);
    const randn = makeNormal(rng);

    // Common year shocks shared by both groups (differenced out by the DiD).
    const yearShock = {};
    KS.forEach((k) => { yearShock[k] = 0.02 * randn(); });

    const sumT = {}, sumC = {}, cntT = {}, cntC = {};
    KS.forEach((k) => { sumT[k] = 0; sumC[k] = 0; cntT[k] = 0; cntC[k] = 0; });

    for (let i = 0; i < nT; i++) {
      const unitFE = 0.05 * randn();
      KS.forEach((k) => {
        const y = unitFE + yearShock[k] + truth[k] + noise * randn();
        sumT[k] += y; cntT[k] += 1;
      });
    }
    for (let i = 0; i < nC; i++) {
      const unitFE = 0.05 * randn();
      KS.forEach((k) => {
        const y = unitFE + yearShock[k] + noise * randn();
        sumC[k] += y; cntC[k] += 1;
      });
    }

    const meanT = (k) => sumT[k] / cntT[k];
    const meanC = (k) => sumC[k] / cntC[k];
    const refT = meanT(-1), refC = meanC(-1);
    const estimate = KS.map((k) => (meanT(k) - refT) - (meanC(k) - refC));

    return { ks: KS.slice(), estimate, true: KS.map((k) => truth[k]) };
  }

  window.DGP = { mulberry32, makeNormal, simulate_event_study, KS };
})();
