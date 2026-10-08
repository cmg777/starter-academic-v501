// dgp.js — seeded RNG and simulated data-generating processes for the LASSO app.
//
// Two DGPs:
//   simulate_lasso({n, p, signal, seed})        used in Tab 2 (LASSO Lab)
//     y = X * theta + epsilon, theta has the first k_signal entries nonzero.
//     The first column of X is the "treatment" (true coefficient = ALPHA_TRUE).
//
//   simulate_dl({n, p, signal, asymmetry, seed}) used in Tab 3 (Penalty Showdown)
//     y = alpha * d + X * theta + epsilon
//     d = X * pi + v
//     "asymmetry" controls how much controls predict d vs y.
//
// All helpers are exported as window.DGP.{rng, randn, simulate_lasso, simulate_dl}.

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

  // ------------------------------------------------------------------
  // IV DGP: simulate an IV problem like the post (rain / drought -> light -> conflict).
  //
  //   z    ~ N(0, 1)                                     instrument (weather)
  //   u    ~ N(0, 1)                                     unobserved confounder
  //   d*   = pi * z + rho * u + eta                      true regressor (latent economic activity)
  //   d    = d* + me_sd * mE                              observed regressor (noisy light proxy)
  //   y    = delta * d* + tau * u + eps                  outcome (conflict)
  //
  //   - pi          = instrument strength (controls first-stage F).
  //   - rho         = confounding strength (regressor correlates with confounder).
  //   - tau         = direct effect of confounder on outcome (omitted variable bias).
  //   - me_sd       = measurement-error sd in the regressor (attenuation bias).
  //   - delta_true  = the true causal effect; OLS will be biased toward zero by
  //                   measurement error AND biased by confounding; 2SLS recovers it.
  //
  // Returns: { z, d, y, n, delta_true, pi, F_first_stage_approx }
  // ------------------------------------------------------------------
  const DELTA_TRUE = -0.30;

  function simulate_iv(opts) {
    const n = Math.max(20, opts.n | 0);
    const pi = +opts.pi || 0.4;
    const rho = +opts.rho || 0.6;
    const tau = +opts.tau || 0.0;
    const me_sd = +opts.me_sd || 1.0;
    const delta_true = (opts.delta_true !== undefined) ? +opts.delta_true : DELTA_TRUE;
    const seed = opts.seed >>> 0;
    const rng = mulberry32(seed || 1);
    const normal = makeNormal(rng);

    const z = new Float64Array(n);
    const u = new Float64Array(n);
    const dstar = new Float64Array(n);
    const d = new Float64Array(n);
    const y = new Float64Array(n);

    // Generate raw variables.
    for (let i = 0; i < n; i++) {
      z[i] = normal();
      u[i] = normal();
    }
    centre(z); centre(u);

    // Latent regressor d* (no measurement error yet).
    for (let i = 0; i < n; i++) {
      dstar[i] = pi * z[i] + rho * u[i] + normal();
    }
    centre(dstar);

    // Observed regressor with measurement error.
    for (let i = 0; i < n; i++) {
      d[i] = dstar[i] + me_sd * normal();
    }
    centre(d);

    // Outcome: causal effect of LATENT d (not measured d) + confounder.
    for (let i = 0; i < n; i++) {
      y[i] = delta_true * dstar[i] + tau * u[i] + normal();
    }
    centre(y);

    // Approximate first-stage F (OLS regression of d on z).
    let szz = 0, szd = 0;
    for (let i = 0; i < n; i++) { szz += z[i] * z[i]; szd += z[i] * d[i]; }
    const beta_z = szd / Math.max(szz, 1e-12);
    let rss = 0, tss = 0;
    let dbar = 0; for (let i = 0; i < n; i++) dbar += d[i]; dbar /= n;
    for (let i = 0; i < n; i++) {
      const fit = beta_z * z[i];
      rss += (d[i] - fit) * (d[i] - fit);
      tss += (d[i] - dbar) * (d[i] - dbar);
    }
    const sigma2 = rss / Math.max(1, n - 2);
    const se_beta = Math.sqrt(sigma2 / Math.max(szz, 1e-12));
    const t_stat = beta_z / Math.max(1e-12, se_beta);
    const F_first_stage = t_stat * t_stat;

    return {
      z, d, y, n,
      delta_true,
      pi, rho, tau, me_sd,
      F_first_stage,
      beta_z,
    };
  }

  // Compute OLS slope of y on d (univariate).
  function ols_uni(d, y, n) {
    let sdd = 0, sdy = 0;
    for (let i = 0; i < n; i++) { sdd += d[i] * d[i]; sdy += d[i] * y[i]; }
    const slope = sdy / Math.max(sdd, 1e-12);
    let rss = 0;
    for (let i = 0; i < n; i++) {
      const fit = slope * d[i];
      rss += (y[i] - fit) * (y[i] - fit);
    }
    const sigma2 = rss / Math.max(1, n - 2);
    const se = Math.sqrt(sigma2 / Math.max(sdd, 1e-12));
    return { slope, se };
  }

  // 2SLS slope of y on d using instrument z (univariate, exactly identified).
  // 2SLS = (z'y) / (z'd) when z is centred.
  function tsls_uni(z, d, y, n) {
    let szd = 0, szy = 0, szz = 0;
    for (let i = 0; i < n; i++) {
      szd += z[i] * d[i];
      szy += z[i] * y[i];
      szz += z[i] * z[i];
    }
    const slope = szy / Math.max(Math.abs(szd), 1e-12) * Math.sign(szd || 1);
    // SE via fitted-d residuals:
    const pi_hat = szd / Math.max(szz, 1e-12);
    let denom = 0, rss = 0;
    for (let i = 0; i < n; i++) {
      const dhat = pi_hat * z[i];
      denom += dhat * dhat;
      const yhat = slope * d[i];
      rss += (y[i] - yhat) * (y[i] - yhat);
    }
    const sigma2 = rss / Math.max(1, n - 2);
    const se = Math.sqrt(sigma2 / Math.max(denom, 1e-12));
    return { slope, se };
  }

  // Build binned-scatter input for first-stage plot.
  function binned_scatter(z, d, n, nBins) {
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => z[a] - z[b]);
    const k = Math.max(2, nBins | 0);
    const size = Math.floor(n / k);
    const binned = [];
    for (let b = 0; b < k; b++) {
      const lo = b * size;
      const hi = (b === k - 1) ? n : (b + 1) * size;
      let sz = 0, sd = 0, cnt = 0;
      for (let j = lo; j < hi; j++) {
        sz += z[order[j]];
        sd += d[order[j]];
        cnt++;
      }
      if (cnt > 0) binned.push({ zbar: sz / cnt, dbar: sd / cnt });
    }
    return binned;
  }

  window.DGP = {
    mulberry32,
    makeNormal,
    simulate_lasso,
    simulate_dl,
    simulate_iv,
    ols_uni,
    tsls_uni,
    binned_scatter,
    ALPHA_TRUE,
    DELTA_TRUE,
  };
})();
