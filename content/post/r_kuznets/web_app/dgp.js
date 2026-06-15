/* dgp.js — math helpers for the Spatial Kuznets lab (no dependencies). */
(function (global) {
  "use strict";

  // Population-weighted coefficient of variation of regional GDP per capita.
  function wcv(y, p) {
    var s = p.reduce(function (a, v) { return a + v; }, 0);
    var pn = p.map(function (v) { return v / s; });
    var ybar = y.reduce(function (a, v, i) { return a + v * pn[i]; }, 0);
    var varw = y.reduce(function (a, v, i) { return a + pn[i] * Math.pow(ybar - v, 2); }, 0);
    return Math.sqrt(varw) / ybar;
  }

  // Evaluate a cubic b1*Y + b2*Y^2 + b3*Y^3 (+ intercept) at Y.
  function cubic(Y, c) {
    return (c.intercept || 0) + c.b1 * Y + c.b2 * Y * Y + c.b3 * Y * Y * Y;
  }

  // Discriminant of the cubic: D = b2^2 - 3 b1 b3.  D>0 => two turning points;
  // D=0 => one inflection; D<0 => monotonic (no real turning points).
  function discriminant(c) { return c.b2 * c.b2 - 3 * c.b1 * c.b3; }

  // Real roots of the derivative b1 + 2 b2 Y + 3 b3 Y^2 = 0  (the turning points).
  function turningPoints(c) {
    var a = 3 * c.b3, b = 2 * c.b2, cc = c.b1;
    if (Math.abs(a) < 1e-9) {                       // quadratic curve -> single root
      if (Math.abs(b) < 1e-12) return [];
      return [-cc / b];
    }
    var disc = b * b - 4 * a * cc;
    if (disc < 0) return [];
    var r1 = (-b - Math.sqrt(disc)) / (2 * a);
    var r2 = (-b + Math.sqrt(disc)) / (2 * a);
    return [Math.min(r1, r2), Math.max(r1, r2)];
  }

  // Sample a curve over a ln(GDP) grid, returned as {x, y} points.
  function curvePoints(c, x0, x1, n) {
    var pts = [], i, x;
    for (i = 0; i <= n; i++) {
      x = x0 + (x1 - x0) * i / n;
      pts.push({ x: x, y: cubic(x, c) });
    }
    return pts;
  }

  // Linear-interpolate between two coefficient sets (for the morph animation).
  function lerpCoef(a, b, t) {
    return {
      intercept: (a.intercept || 0) * (1 - t) + (b.intercept || 0) * t,
      b1: a.b1 * (1 - t) + b.b1 * t,
      b2: a.b2 * (1 - t) + b.b2 * t,
      b3: a.b3 * (1 - t) + b.b3 * t
    };
  }

  global.KuzDGP = {
    wcv: wcv, cubic: cubic, discriminant: discriminant, turningPoints: turningPoints,
    curvePoints: curvePoints, lerpCoef: lerpCoef
  };
})(window);
