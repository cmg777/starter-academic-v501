// dgp.js — seeded RNG + helper distributions exported as window.DGP.
//
// The r_causalpolicy_workshop app uses only mulberry32 (seeded RNG) and
// makeNormal (Box-Muller standard normal draws) — see app.js
// `simulatePanel` for the actual data-generating process used in
// Tabs 2 and 4 (a stylised J+1 state, T-year policy panel).
//
// The simulate_lasso / simulate_dl helpers below are inherited from the
// write-app reference implementation (r_double_lasso). They are not invoked
// by this app but are kept so the cross-app smoke test continues to pass.
// All helpers are exported as window.DGP.{mulberry32, makeNormal,
// simulate_lasso, simulate_dl}.

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

  // Box-Muller: convert two uniforms to two standard normals. We return one and
  // stash the other for the next call.
  function makeNormal(rng) {
    let cached = null;
    return function () {
      if (cached !== null) {
        const r = cached;
        cached = null;
        return r;
      }
      let u, v;
      do { u = rng(); } while (u < 1e-10);
      v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    };
  }

  // Build an n x p matrix of standard normals as Float64Array stored row-major.
  function randn_matrix(n, p, normal) {
    const A = new Float64Array(n * p);
    for (let i = 0; i < n * p; i++) A[i] = normal();
    return A;
  }

  // Standardise columns of X (mean 0, sd 1). Modifies X in place. Returns means / sds for later inverse.
  function standardise(X, n, p) {
    const means = new Float64Array(p);
    const sds = new Float64Array(p);
    for (let j = 0; j < p; j++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += X[i * p + j];
      means[j] = s / n;
    }
    for (let j = 0; j < p; j++) {
      let ss = 0;
      for (let i = 0; i < n; i++) {
        const c = X[i * p + j] - means[j];
        ss += c * c;
      }
      sds[j] = Math.sqrt(ss / n) || 1.0;
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < p; j++) {
        X[i * p + j] = (X[i * p + j] - means[j]) / sds[j];
      }
    }
    return { means, sds };
  }

  // Centre a vector in place. Returns its mean for later use.
  function centre(y) {
    let m = 0;
    for (let i = 0; i < y.length; i++) m += y[i];
    m /= y.length;
    for (let i = 0; i < y.length; i++) y[i] -= m;
    return m;
  }

  // ------------------------------------------------------------------
  // Tab 2 DGP: a single LASSO regression problem.
  //   y = alpha * x_0 + sum_{j in S} theta_j * x_j + epsilon
  //   |S| = k_signal = round(0.15 * p) — about 15% of columns are truly relevant.
  //   theta_j ~ N(0, signal^2) for j in S; 0 otherwise.
  //   alpha = ALPHA_TRUE = 0.5.
  // ------------------------------------------------------------------
  const ALPHA_TRUE = 0.5;

  function simulate_lasso(opts) {
    const n = Math.max(20, opts.n | 0);
    const p = Math.max(2, opts.p | 0);
    const signal = +opts.signal || 0.6;
    const seed = opts.seed >>> 0;
    const rng = mulberry32(seed || 1);
    const normal = makeNormal(rng);

    const X = randn_matrix(n, p, normal);
    standardise(X, n, p);

    // Pick true support: at least 1, at most p-1; about 15% of columns.
    const k = Math.max(1, Math.min(p - 1, Math.round(0.15 * p)));
    const theta = new Float64Array(p);
    theta[0] = ALPHA_TRUE; // treatment column
    for (let j = 1; j <= k; j++) {
      theta[j] = signal * normal();
    }

    // Build y = X * theta + epsilon, with epsilon ~ N(0, sigma^2). Set sigma so
    // that signal-to-noise ratio is roughly 1 (a noisy but tractable problem).
    let sigVar = 0;
    for (let j = 0; j < p; j++) sigVar += theta[j] * theta[j];
    const sigma = Math.sqrt(Math.max(sigVar, 0.1));
    const y = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < p; j++) s += X[i * p + j] * theta[j];
      y[i] = s + sigma * normal();
    }
    centre(y);

    return { X, y, n, p, theta, alpha_true: ALPHA_TRUE, signal: sigma };
  }

  // ------------------------------------------------------------------
  // Tab 3 DGP: Double LASSO problem.
  //   d = X * pi + v
  //   y = alpha * d + X * theta + epsilon
  //   asymmetry in [0, 1]:
  //     0  — symmetric: pi and theta have same support size and magnitudes
  //     1  — extreme: |support(theta)| ≈ 1 (outcome nearly unpredictable from X),
  //                   |support(pi)|   ≈ round(0.2 * p) (treatment well-predicted)
  //   This recreates the |I_y| = 0, |I_d| = 8 fingerprint described in §9 of the post.
  // ------------------------------------------------------------------
  function simulate_dl(opts) {
    const n = Math.max(20, opts.n | 0);
    const p = Math.max(2, opts.p | 0);
    const signal = +opts.signal || 0.6;
    const asymmetry = Math.max(0, Math.min(1, +opts.asymmetry || 0));
    const seed = opts.seed >>> 0;
    const rng = mulberry32(seed || 1);
    const normal = makeNormal(rng);

    const X = randn_matrix(n, p, normal);
    standardise(X, n, p);

    // Sparsity targets.
    const k_d = Math.max(2, Math.min(p - 1, Math.round(0.20 * p)));
    // k_y interpolates from k_d (symmetric) to 1 (extreme asymmetry).
    const k_y_full = k_d;
    const k_y_min = 1;
    const k_y = Math.max(1, Math.round(k_y_full + (k_y_min - k_y_full) * asymmetry));

    // theta and pi share support starting from index 0 (controls 0..k-1 matter).
    // Magnitudes of theta also shrink with asymmetry so that outcome becomes
    // less predictable from X.
    const theta = new Float64Array(p);
    const pi = new Float64Array(p);
    const theta_scale = signal * (1 - 0.7 * asymmetry); // outcome signal fades
    const pi_scale = signal * (1 + 0.5 * asymmetry);    // treatment signal grows

    for (let j = 0; j < k_d; j++) pi[j] = pi_scale * normal();
    for (let j = 0; j < k_y; j++) theta[j] = theta_scale * normal();

    // Generate d = X * pi + v
    const v_sd = Math.max(0.5, pi_scale * 0.6);
    const d = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < p; j++) s += X[i * p + j] * pi[j];
      d[i] = s + v_sd * normal();
    }
    centre(d);
    // Standardise d to unit variance so estimates are comparable across draws.
    let dvar = 0;
    for (let i = 0; i < n; i++) dvar += d[i] * d[i];
    const dsd = Math.sqrt(dvar / n) || 1;
    for (let i = 0; i < n; i++) d[i] /= dsd;

    // Generate y = alpha * d + X * theta + epsilon
    const alpha_true = ALPHA_TRUE;
    let theta_var = 0;
    for (let j = 0; j < p; j++) theta_var += theta[j] * theta[j];
    const eps_sd = Math.sqrt(Math.max(theta_var + 0.5, 0.5));
    const y = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let s = alpha_true * d[i];
      for (let j = 0; j < p; j++) s += X[i * p + j] * theta[j];
      y[i] = s + eps_sd * normal();
    }
    centre(y);

    return {
      X, y, d, n, p, theta, pi,
      alpha_true: ALPHA_TRUE,
      asymmetry,
      k_y_true: k_y,
      k_d_true: k_d,
    };
  }

  window.DGP = {
    mulberry32,
    makeNormal,
    simulate_lasso,
    simulate_dl,
    ALPHA_TRUE,
  };
})();
