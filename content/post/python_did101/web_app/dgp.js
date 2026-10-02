// dgp.js — seeded RNG helpers for the DiD Simulator (Tab 2).
//
// Exported as window.DGP.{mulberry32, makeNormal}.

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

  window.DGP = {
    mulberry32,
    makeNormal,
  };
})();
