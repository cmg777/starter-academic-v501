// app.js — wires the DOM controls for python_kuznets_dmsp to KMATH + CHARTS.
// Topic: predicting GDP from nighttime lights, population-weighted inequality
// indices, the regional Kuznets curve, and Conley spatial-HAC standard errors.
// Runs after window.KMATH and window.CHARTS are defined and d3 is loaded.

(function () {
  "use strict";

  // ---- tab switching ----
  function activateTab(paneId) {
    document.querySelectorAll(".tab-strip button").forEach(btn => {
      const isActive = btn.dataset.pane === paneId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab-strip button").forEach(btn => {
    btn.addEventListener("click", () => activateTab(btn.dataset.pane));
  });
  document.querySelectorAll(".cta-card[data-goto]").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  const PALETTE = window.CHARTS.palette;
  const REGION_COLORS = ["#6a9bcc", "#d97757", "#00d4c8", "#9bdcc3", "#c98ad9", "#e0c060"];

  // ---- load the post's numbers, then boot ----
  fetch("data/results.json")
    .then(r => r.json())
    .then(boot)
    .catch(() => boot(FALLBACK)); // run with baked-in numbers if fetch is blocked (file://)

  // Minimal fallback so the app still works if results.json cannot be fetched.
  const FALLBACK = {
    light_elasticity: { re_col7: 0.102, fe_col2: 0.190 },
    prediction: { corr_pred_vs_observed: 0.925 },
    kuznets_cubic: { const: -0.799, lg: 0.293, lg2: -0.032, lg3: 0.00112, log_gdp_min: 6.5, log_gdp_max: 11.5 },
    conley: { beta: 0.190, naive_se: 0.013, by_radius_km: [
      { radius: 1000, se: 0.026 }, { radius: 2500, se: 0.034 }, { radius: 5000, se: 0.037 }] },
    regions_default: {
      names: ["Capital", "Coast", "Industrial", "Plains", "Highlands", "Frontier"],
      income_kusd: [22.0, 14.0, 11.0, 7.5, 5.0, 3.5],
      pop_millions: [8.0, 6.0, 9.0, 5.0, 3.0, 1.5] },
  };

  function boot(D) {
    initLights(D);
    initIndex(D);
    initKuznets(D);
    initSpatial(D);
  }

  // ==================================================================
  // TAB 1 — Lights -> GDP
  // ==================================================================
  function initLights(D) {
    const chart = window.CHARTS.calibration(document.getElementById("lt-chart"), { beta: D.light_elasticity.re_col7 });
    const slider = document.getElementById("lt-beta");
    const valEl = document.getElementById("lt-beta-val");
    const statBeta = document.getElementById("lt-stat-beta");
    const statPct = document.getElementById("lt-stat-pct");

    function render(beta) {
      valEl.textContent = beta.toFixed(3);
      statBeta.textContent = beta.toFixed(3);
      statPct.textContent = (beta * 10).toFixed(1);     // 10% brighter -> 10*beta % richer
      chart.update(beta);
    }
    slider.addEventListener("input", () => render(+slider.value));
    document.getElementById("lt-snap-102").addEventListener("click", () => { slider.value = D.light_elasticity.re_col7; render(D.light_elasticity.re_col7); });
    document.getElementById("lt-snap-190").addEventListener("click", () => { slider.value = D.light_elasticity.fe_col2; render(D.light_elasticity.fe_col2); });
    render(D.light_elasticity.re_col7);
  }

  // ==================================================================
  // TAB 2 — inequality index builder
  // ==================================================================
  function initIndex(D) {
    const def = D.regions_default;
    const N = def.names.length;
    const INC_MIN = 1, INC_MAX = 30, POP_MIN = 0.2, POP_MAX = 12;

    // state
    let income = def.income_kusd.slice();
    let pop = def.pop_millions.slice();

    const grid = document.getElementById("ix-regions");
    const chart = window.CHARTS.regionProfile(document.getElementById("ix-chart"));

    // build the per-region editor cards
    function buildCards() {
      grid.innerHTML = "";
      for (let i = 0; i < N; i++) {
        const card = document.createElement("div");
        card.className = "region-card";
        card.innerHTML = `
          <div class="region-name"><span><span class="swatch" style="background:${REGION_COLORS[i]}"></span>${def.names[i]}</span></div>
          <div class="slider-row">
            <label>income (k$) <span class="v" id="ix-inc-v-${i}"></span></label>
            <input type="range" class="inc-slider" data-i="${i}" min="${INC_MIN}" max="${INC_MAX}" step="0.5" value="${income[i]}">
          </div>
          <div class="slider-row">
            <label>population (m) <span class="v" id="ix-pop-v-${i}"></span></label>
            <input type="range" class="pop-slider" data-i="${i}" min="${POP_MIN}" max="${POP_MAX}" step="0.1" value="${pop[i]}">
          </div>`;
        grid.appendChild(card);
      }
      grid.querySelectorAll(".inc-slider").forEach(s => s.addEventListener("input", () => {
        income[+s.dataset.i] = +s.value; render();
      }));
      grid.querySelectorAll(".pop-slider").forEach(s => s.addEventListener("input", () => {
        pop[+s.dataset.i] = +s.value; render();
      }));
    }

    function syncSliders() {
      for (let i = 0; i < N; i++) {
        grid.querySelector(`.inc-slider[data-i="${i}"]`).value = income[i];
        grid.querySelector(`.pop-slider[data-i="${i}"]`).value = pop[i];
      }
    }

    const fmt = d3.format(".4f");
    function render() {
      for (let i = 0; i < N; i++) {
        document.getElementById(`ix-inc-v-${i}`).textContent = income[i].toFixed(1);
        document.getElementById(`ix-pop-v-${i}`).textContent = pop[i].toFixed(1);
      }
      const idx = window.KMATH.inequality(income, pop);
      document.getElementById("ix-gini").textContent = fmt(idx.gini);
      document.getElementById("ix-gini-unw").textContent = fmt(idx.gini_unw);
      document.getElementById("ix-theil").textContent = fmt(idx.theil);
      document.getElementById("ix-cv").textContent = fmt(idx.cv);
      document.getElementById("ix-mld").textContent = fmt(idx.mld);
      const regions = income.map((inc, i) => ({ name: def.names[i], income: inc, pop: pop[i] }));
      chart.update(regions, REGION_COLORS);
    }

    document.getElementById("ix-reset").addEventListener("click", () => {
      income = def.income_kusd.slice(); pop = def.pop_millions.slice(); syncSliders(); render();
    });
    document.getElementById("ix-equalize").addEventListener("click", () => {
      income = income.map(() => 12); syncSliders(); render();
    });
    document.getElementById("ix-onerich").addEventListener("click", () => {
      income = [28, 7, 6, 6, 5, 4]; pop = [9, 4, 4, 3, 2, 1]; syncSliders(); render();
    });

    buildCards();
    render();
  }

  // ==================================================================
  // TAB 3 — Kuznets explorer
  // ==================================================================
  function initKuznets(D) {
    const k = D.kuznets_cubic;
    const lgMin = k.log_gdp_min, lgMax = k.log_gdp_max;
    // post cubic coefficients in ascending-power form [const, lg, lg2, lg3]
    const cubic = [k.const, k.lg, k.lg2, k.lg3];

    // Build a realistic point cloud around the post cubic (seeded, fixed).
    const cloud = window.KMATH.kuznetsCloud(cubic, lgMin, lgMax, 260, 0.018, 7);

    // y-axis max from the cloud + curve
    let giniMax = 0;
    cloud.forEach(p => { if (p.gini > giniMax) giniMax = p.gini; });
    for (let i = 0; i <= 100; i++) {
      const lg = lgMin + (lgMax - lgMin) * i / 100;
      giniMax = Math.max(giniMax, window.KMATH.polyval(cubic, lg));
    }
    giniMax = Math.min(0.2, giniMax * 1.15);

    const chart = window.CHARTS.kuznets(document.getElementById("kz-chart"),
      { cloud, lgMin, lgMax, giniMax });

    const fmt = d3.format(".4f");
    function fitForOrder(order) {
      // Refit a polynomial of the chosen degree to the SAME cloud, so the user
      // sees how the curve changes as terms are added. The cubic recovers the
      // post's coefficients (since the cloud was generated from them).
      const xs = cloud.map(p => p.lg), ys = cloud.map(p => p.gini);
      return window.KMATH.polyfit(xs, ys, order);
    }

    function shapeLabel(order, coef) {
      if (order === 1) return coef[1] >= 0 ? "Upward" : "Downward";
      if (order === 2) return coef[2] < 0 ? "Inverted-U" : "U-shape";
      // cubic: check sign pattern of lg, lg2, lg3
      const s = (coef[1] > 0 ? "+" : "−") + (coef[2] < 0 ? "−" : "+") + (coef[3] > 0 ? "+" : "−");
      return s === "+−+" ? "N-shape" : "Cubic";
    }

    function render(order) {
      const coef = fitForOrder(order);
      // pad to length 4 for the stat readout
      const c = [coef[0] || 0, coef[1] || 0, coef[2] || 0, coef[3] || 0];
      document.getElementById("kz-b1").textContent = c[1] ? fmt(c[1]) : "—";
      document.getElementById("kz-b2").textContent = order >= 2 ? fmt(c[2]) : "—";
      document.getElementById("kz-b3").textContent = order >= 3 ? d3.format(".5f")(c[3]) : "—";
      document.getElementById("kz-shape").textContent = shapeLabel(order, c);

      // For the cubic, mark the two turning points (where derivative = 0).
      let marks = [];
      if (order === 3 && c[3] !== 0) {
        const a = 3 * c[3], b = 2 * c[2], cc = c[1];
        const disc = b * b - 4 * a * cc;
        if (disc > 0) {
          const r1 = (-b - Math.sqrt(disc)) / (2 * a);
          const r2 = (-b + Math.sqrt(disc)) / (2 * a);
          [r1, r2].forEach((rt, i) => {
            if (rt >= lgMin && rt <= lgMax)
              marks.push({ lg: rt, label: i === 0 ? "peak" : "trough" });
          });
        }
      }
      chart.update(coef, marks);
    }

    document.querySelectorAll("#kz-order button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#kz-order button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render(+btn.dataset.order);
      });
    });
    render(3);
  }

  // ==================================================================
  // TAB 4 — Conley spatial errors
  // ==================================================================
  function initSpatial(D) {
    const con = D.conley;
    const beta = con.beta, naiveSe = con.naive_se;
    const pts = con.by_radius_km;   // [{radius, se}, ...] anchor points

    // x range wide enough for the widest CI plus the zero reference
    const widestSe = d3.max(pts, p => p.se);
    const xMax = beta + 1.96 * widestSe + 0.04;
    const chart = window.CHARTS.conleyCI(document.getElementById("sp-chart"),
      { xMin: -0.02, xMax });

    // Linear interpolation of the Conley SE between the three anchor radii.
    function seAt(radius) {
      if (radius <= pts[0].radius) return pts[0].se;
      if (radius >= pts[pts.length - 1].radius) return pts[pts.length - 1].se;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        if (radius >= a.radius && radius <= b.radius) {
          const t = (radius - a.radius) / (b.radius - a.radius);
          return a.se + t * (b.se - a.se);
        }
      }
      return pts[pts.length - 1].se;
    }

    const slider = document.getElementById("sp-r");
    const valEl = document.getElementById("sp-r-val");
    const seEl = document.getElementById("sp-se");
    const tEl = document.getElementById("sp-t");

    function render(radius) {
      const se = seAt(radius);
      valEl.textContent = d3.format(",")(radius);
      seEl.textContent = se.toFixed(3);
      tEl.textContent = (beta / se).toFixed(1);
      chart.update(beta, se, naiveSe);
    }
    slider.addEventListener("input", () => render(+slider.value));
    document.getElementById("sp-1000").addEventListener("click", () => { slider.value = 1000; render(1000); });
    document.getElementById("sp-2500").addEventListener("click", () => { slider.value = 2500; render(2500); });
    document.getElementById("sp-5000").addEventListener("click", () => { slider.value = 5000; render(5000); });
    render(1000);
  }

})();
