// dgp.js — math + data-generating helpers for the "Regional Inequality from
// Outer Space" web app (python_kuznets_dmsp).
//
// This file deliberately mirrors the from-scratch formulas in the post:
//   * the population-weighted inequality indices of §7.2 (Gini, GE(-1), GE(0)
//     = MLD, GE(1) = Theil, CV), plus the equal-weight Gini of §7.4;
//   * a seeded RNG (Mulberry32 + Box-Muller) used to scatter a realistic cloud
//     of country-periods around the fitted Kuznets cubic in Tab 3;
//   * a small least-squares polynomial fit so Tab 3 can re-fit linear / quadratic
//     / cubic curves to the cloud the user sees;
//   * a standard-normal CDF so Tab 1 / Tab 4 can shade calibration / CI bands.
//
// Everything is exposed on window.KMATH.

(function () {
  "use strict";

  // ---- seeded RNG ---------------------------------------------------
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
  function makeNormal(rng) {
    let cached = null;
    return function () {
      if (cached !== null) { const r = cached; cached = null; return r; }
      let u, v;
      do { u = rng(); } while (u < 1e-10);
      v = rng();
      const mag = Math.sqrt(-2 * Math.log(u));
      cached = mag * Math.sin(2 * Math.PI * v);
      return mag * Math.cos(2 * Math.PI * v);
    };
  }

  // ---- standard-normal CDF (Abramowitz & Stegun 7.1.26 via erf) -----
  function normCdf(z) {
    // erf approximation
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t
              - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    const cdf = 0.5 * (1 + (z >= 0 ? 1 : -1) * y);
    return Math.min(1, Math.max(0, cdf));
  }

  // ------------------------------------------------------------------
  // Population-weighted inequality indices — a faithful JS port of the
  // ineq_indices() function in §7.2 of the post.
  //   y = region incomes (>0), w = region populations (>0).
  // Returns { gini, gini_unw, theil, mld, ge_m1, cv, mean }.
  // ------------------------------------------------------------------
  function inequality(yIn, wIn) {
    const y = [], w = [];
    for (let i = 0; i < yIn.length; i++) {
      const yi = +yIn[i], wi = +wIn[i];
      if (isFinite(yi) && isFinite(wi) && yi > 0 && wi > 0) { y.push(yi); w.push(wi); }
    }
    const n = y.length;
    if (n < 2) {
      return { gini: 0, gini_unw: 0, theil: 0, mld: 0, ge_m1: 0, cv: 0, mean: n ? y[0] : 0, n: n };
    }
    let sw = 0;
    for (let i = 0; i < n; i++) sw += w[i];
    let mu = 0;
    for (let i = 0; i < n; i++) mu += w[i] * y[i];
    mu /= sw;                               // population-weighted mean

    // population shares p_i and relative incomes r_i
    let ge_m1 = 0, ge_0 = 0, ge_1 = 0, cv_sum = 0;
    for (let i = 0; i < n; i++) {
      const p = w[i] / sw;
      const r = y[i] / mu;
      ge_m1 += p * (1 / r);                 // sum p_i / r_i
      ge_0  += p * (-Math.log(r));          // GE(0) = MLD = sum p_i ln(1/r_i)
      ge_1  += p * r * Math.log(r);         // GE(1) = Theil = sum p_i r_i ln r_i
      cv_sum += p * r * r;                  // sum p_i r_i^2
    }
    const ge_m1_final = 0.5 * (ge_m1 - 1);
    const cv = Math.sqrt(Math.max(0, cv_sum - 1));

    // Weighted Gini: double sum |y_i - y_j| w_i w_j / (2 (sum w)^2 mu)
    let numer = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        numer += Math.abs(y[i] - y[j]) * w[i] * w[j];
      }
    }
    const gini = numer / (2 * sw * sw * mu);

    // Equal-weight (unweighted) Gini: every region counts once
    let muU = 0;
    for (let i = 0; i < n; i++) muU += y[i];
    muU /= n;
    let numU = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) numU += Math.abs(y[i] - y[j]);
    }
    const gini_unw = numU / (2 * n * n * muU);

    return { gini, gini_unw, theil: ge_1, mld: ge_0, ge_m1: ge_m1_final, cv, mean: mu, n };
  }

  // ------------------------------------------------------------------
  // Least-squares polynomial fit of degree `deg` (1, 2, or 3).
  //   xs, ys arrays; returns coefficient array [c0, c1, ..., c_deg]
  //   such that yhat = c0 + c1 x + c2 x^2 + ...
  // Normal equations solved by Gauss-Jordan; x is centred internally for
  // conditioning, then coefficients are mapped back to raw x.
  // ------------------------------------------------------------------
  function polyfit(xs, ys, deg) {
    const n = xs.length;
    const k = deg + 1;
    // centre x for numerical stability
    let xbar = 0;
    for (let i = 0; i < n; i++) xbar += xs[i];
    xbar /= n;
    const xc = xs.map(x => x - xbar);

    // build normal equations A c = b in centred basis
    const A = [], b = [];
    for (let r = 0; r < k; r++) {
      A.push(new Array(k).fill(0));
      b.push(0);
    }
    // power sums
    const pow = new Array(2 * deg + 1).fill(0);
    for (let i = 0; i < n; i++) {
      let xp = 1;
      for (let m = 0; m <= 2 * deg; m++) { pow[m] += xp; xp *= xc[i]; }
    }
    for (let r = 0; r < k; r++)
      for (let c = 0; c < k; c++)
        A[r][c] = pow[r + c];
    for (let i = 0; i < n; i++) {
      let xp = 1;
      for (let r = 0; r < k; r++) { b[r] += xp * ys[i]; xp *= xc[i]; }
    }
    const cCentred = solve(A, b, k);
    if (!cCentred) return null;

    // map centred coefficients back to raw x via binomial expansion of (x - xbar)^m
    const raw = new Array(k).fill(0);
    for (let m = 0; m < k; m++) {
      // cCentred[m] * (x - xbar)^m
      for (let t = 0; t <= m; t++) {
        raw[t] += cCentred[m] * binom(m, t) * Math.pow(-xbar, m - t);
      }
    }
    return raw;
  }

  function binom(n, k) {
    let r = 1;
    for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
    return r;
  }

  // Gauss-Jordan solve A x = b, returns x or null if singular.
  function solve(Ain, bin, k) {
    const A = Ain.map(row => row.slice());
    const b = bin.slice();
    for (let i = 0; i < k; i++) {
      let piv = i, best = Math.abs(A[i][i]);
      for (let r = i + 1; r < k; r++) {
        const v = Math.abs(A[r][i]);
        if (v > best) { best = v; piv = r; }
      }
      if (best < 1e-12) return null;
      if (piv !== i) { const tA = A[i]; A[i] = A[piv]; A[piv] = tA; const tb = b[i]; b[i] = b[piv]; b[piv] = tb; }
      const pv = A[i][i];
      for (let c = 0; c < k; c++) A[i][c] /= pv;
      b[i] /= pv;
      for (let r = 0; r < k; r++) {
        if (r === i) continue;
        const f = A[r][i];
        if (f === 0) continue;
        for (let c = 0; c < k; c++) A[r][c] -= f * A[i][c];
        b[r] -= f * b[i];
      }
    }
    return b;
  }

  // Evaluate a polynomial (coeff array, ascending powers) at x.
  function polyval(coef, x) {
    let s = 0, xp = 1;
    for (let i = 0; i < coef.length; i++) { s += coef[i] * xp; xp *= x; }
    return s;
  }

  // Pearson correlation.
  function corr(a, b) {
    const n = a.length;
    let ma = 0, mb = 0;
    for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
    ma /= n; mb /= n;
    let sab = 0, saa = 0, sbb = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - ma, db = b[i] - mb;
      sab += da * db; saa += da * da; sbb += db * db;
    }
    return sab / Math.sqrt(saa * sbb || 1);
  }

  // ------------------------------------------------------------------
  // Generate a realistic cloud of country-period points for Tab 3:
  // each point is (log GDP, regional Gini) drawn around the post's fitted
  // cubic (const -0.799, lg 0.293, lg2 -0.032, lg3 0.00112) with noise.
  // Returns array of { lg, gini }.
  // ------------------------------------------------------------------
  function kuznetsCloud(coef, lgMin, lgMax, nPoints, noiseSd, seed) {
    const rng = mulberry32(seed >>> 0 || 7);
    const normal = makeNormal(rng);
    const pts = [];
    for (let i = 0; i < nPoints; i++) {
      // sample lg from a roughly bell-shaped distribution within range
      let lg = (lgMin + lgMax) / 2 + (normal() * (lgMax - lgMin) / 4.2);
      lg = Math.max(lgMin, Math.min(lgMax, lg));
      const fit = polyval(coef, lg);
      let g = fit + normal() * noiseSd;
      if (g < 0.002) g = 0.002 + Math.abs(normal()) * 0.004;
      pts.push({ lg: lg, gini: g });
    }
    return pts;
  }

  window.KMATH = {
    mulberry32, makeNormal, normCdf,
    inequality, polyfit, polyval, corr, kuznetsCloud,
  };
})();
