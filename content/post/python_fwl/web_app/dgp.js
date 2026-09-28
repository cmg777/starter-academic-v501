// dgp.js — seeded RNG and the store-level data-generating process shared by
// the Confounding Lab (Tab 2) and the Monte Carlo experiment (Tab 4).
//
// The simulator keeps the post's income and coupon equations from
// simulate_store_data() in script.py:
//   income  ~ N(50, 10^2)
//   coupons = 60 + pi * income + N(0, 5^2)        (post: pi = -0.5)
//   sales   = 10 + beta * coupons + gamma * income + N(0, 3^2)
//                                                  (post: beta = 0.2, gamma = 0.3)
// The post's day-of-week term is left out: it is unrelated to coupons, so it
// adds noise but cannot bias any coupon estimate.
//
// Exported as window.DGP.

(function () {
  "use strict";

  // Mulberry32 — small, fast, seeded PRNG. Returns a function () -> [0, 1).
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Box-Muller: two uniforms -> two standard normals; one is cached.
  function makeNormal(rng) {
    let cached = null;
    return function () {
      if (cached !== null) {
        const r = cached;
        cached = null;
        return r;
      }
      let u;
      do { u = rng(); } while (u < 1e-10);
      const v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    };
  }

  // Constants of the simulator (same values as the post's DGP).
  const CONST = {
    income_mean: 50,
    income_sd: 10,
    coupons_intercept: 60,
    coupons_noise_sd: 5,
    sales_intercept: 10,
    sales_noise_sd: 3,
  };

  // Population slope from regressing income ON coupons:
  //   delta = Cov(I, C) / Var(C) = pi * sI^2 / (pi^2 * sI^2 + sC^2).
  // This is the delta of the omitted-variable-bias formula. It is NOT the
  // DGP slope pi (income -> coupons); at the post's pi = -0.5 it equals -1.0.
  function population_delta(pi, sdI, sdC) {
    const vI = (sdI === undefined ? CONST.income_sd : sdI) ** 2;
    const vC = (sdC === undefined ? CONST.coupons_noise_sd : sdC) ** 2;
    return (pi * vI) / (pi * pi * vI + vC);
  }

  // Population omitted-variable bias of the naive slope: gamma * delta.
  // The naive estimator converges to beta + gamma * delta.
  function population_bias(gamma, pi, sdI, sdC) {
    return gamma * population_delta(pi, sdI, sdC);
  }

  // Fit the naive, full and FWL regressions on one sample.
  //   naive : sales ~ coupons
  //   full  : sales ~ coupons + income  (normal equations on centered data)
  //   fwl   : residualize coupons and sales on income, then slope of the
  //           residuals (no intercept; SE uses the full model's n - 3 df)
  //   delta_hat : slope of income ON coupons (the OVB auxiliary regression)
  // In every sample: naive.b - fwl.b === full.gamma_hat * delta_hat (algebra).
  function fit_fwl(sales, coupons, income) {
    const n = sales.length;
    let mS = 0, mC = 0, mI = 0;
    for (let i = 0; i < n; i++) { mS += sales[i]; mC += coupons[i]; mI += income[i]; }
    mS /= n; mC /= n; mI /= n;
    let Scc = 0, Sii = 0, Sss = 0, Sci = 0, Scs = 0, Sis = 0;
    for (let i = 0; i < n; i++) {
      const c = coupons[i] - mC, x = income[i] - mI, s = sales[i] - mS;
      Scc += c * c; Sii += x * x; Sss += s * s;
      Sci += c * x; Scs += c * s; Sis += x * s;
    }

    // Naive: sales on coupons.
    const bN = Scs / Scc;
    const ssrN = Math.max(0, Sss - bN * Scs);
    const seN = Math.sqrt(ssrN / Math.max(1, n - 2) / Scc);

    // Full: sales on coupons + income.
    const det = Scc * Sii - Sci * Sci;
    const bF = (Sii * Scs - Sci * Sis) / det;
    const gF = (Scc * Sis - Sci * Scs) / det;
    const ssrF = Math.max(0, Sss - bF * Scs - gF * Sis);
    const seF = Math.sqrt(ssrF / Math.max(1, n - 3) * Sii / det);

    // FWL: explicit residual vectors (what the post's Step 2 does).
    const piHat = Sci / Sii;              // coupons on income (partialling-out slope)
    const piA = mC - piHat * mI;
    const sHat = Sis / Sii;               // sales on income
    const sA = mS - sHat * mI;
    const cT = new Float64Array(n), sT = new Float64Array(n);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      cT[i] = coupons[i] - (piA + piHat * income[i]);
      sT[i] = sales[i] - (sA + sHat * income[i]);
      num += cT[i] * sT[i];
      den += cT[i] * cT[i];
    }
    const bW = num / den;
    let ssrW = 0;
    for (let i = 0; i < n; i++) { const r = sT[i] - bW * cT[i]; ssrW += r * r; }
    const seW = Math.sqrt(ssrW / Math.max(1, n - 3) / den);

    return {
      n,
      naive: { b: bN, se: seN },
      full: { b: bF, se: seF, gamma_hat: gF },
      fwl: { b: bW, se: seW },
      delta_hat: Sci / Scc,               // income ON coupons
      pi_hat: piHat,                      // coupons ON income
      coupons_tilde: cT,
      sales_tilde: sT,
    };
  }

  // Simulate one sample of n stores and fit all three regressions.
  //   opts: { n, gamma, pi, beta, seed, sigma_y?, sigma_c? }
  function simulate_fwl_sample(opts) {
    const n = Math.max(20, opts.n | 0);
    const gamma = +opts.gamma;
    const pi = +opts.pi;
    const beta = +opts.beta;
    const sigY = +opts.sigma_y || CONST.sales_noise_sd;
    const sigC = +opts.sigma_c || CONST.coupons_noise_sd;
    const seed = (opts.seed >>> 0) || 1;
    const normal = makeNormal(mulberry32(seed));

    const income = new Float64Array(n);
    const coupons = new Float64Array(n);
    const sales = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      income[i] = CONST.income_mean + CONST.income_sd * normal();
      coupons[i] = CONST.coupons_intercept + pi * income[i] + sigC * normal();
      sales[i] = CONST.sales_intercept + beta * coupons[i] + gamma * income[i] + sigY * normal();
    }
    const fit = fit_fwl(sales, coupons, income);
    fit.income = income;
    fit.coupons = coupons;
    fit.sales = sales;
    fit.beta_true = beta;
    return fit;
  }

  window.DGP = {
    mulberry32,
    makeNormal,
    CONST,
    population_delta,
    population_bias,
    fit_fwl,
    simulate_fwl_sample,
  };
})();
