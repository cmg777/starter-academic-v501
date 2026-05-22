// app.js — wires DOM controls to D3/DGP modules for the
// r_causalpolicy_workshop post. Runs after dgp.js, lasso.js, charts.js,
// and D3 are loaded.

(function () {
  "use strict";

  // ---- Tab switching ---------------------------------------------------------
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

  // ---- Generic debounce ------------------------------------------------------
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ---- Theme constants -------------------------------------------------------
  const C = {
    bg: "#0f1729", panel: "#1f2b5e", panel2: "#182447",
    steel: "#6a9bcc", orange: "#d97757", teal: "#00d4c8",
    text: "#e8ecf2", muted: "#8b9dc3", faint: "rgba(232,236,242,0.3)",
  };

  // =============================================================================
  // TAB 1 — Counterfactual animation
  // =============================================================================
  // California's observed 1970-2000 series (per-capita pack sales, approx values
  // taken from the post's tutorial.qmd output and the Abadie et al. (2010) data).
  const CA_YEARS = [1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,
                    1980,1981,1982,1983,1984,1985,1986,1987,1988,
                    1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000];
  const CA_OBS   = [123,121,124,124,127,127,128,127,127,124,
                    120,118,114,112, 110.4,109.0,104.4,100.8, 90.1,
                    82.4,77.8,68.7,67.3,63.4,58.6,56.4,54.5,53.8,52.3,47.2,41.6];
  const POLICY_YR = 1989;

  function counterfactual(method) {
    const out = new Array(CA_YEARS.length).fill(null);
    for (let i = 0; i < CA_YEARS.length; i++) {
      const t = CA_YEARS[i];
      if (t < POLICY_YR) { out[i] = CA_OBS[i]; continue; }
      switch (method) {
        case "naive":
          // California's pre-period mean as the counterfactual
          out[i] = 116.0;
          break;
        case "did": {
          // Nevada-style: pre-period CA mean plus Nevada's change.
          // Nevada pre 1984-88 mean ~143.1; post 1989-93 mean ~121.8 ⇒ Δ ≈ -21.3
          // Held constant after 1993 for the visual.
          const delta = -21.3 * Math.min(1, (t - 1988) / 5);
          out[i] = 116.0 + delta;
          break;
        }
        case "its_growth": {
          // Linear pre-period fit: intercept 3637.79, slope -1.78 (per year)
          out[i] = 3637.79 - 1.78 * t;
          break;
        }
        case "its_arima": {
          // ARIMA(1,2,0) extrapolation: aggressively bends downward.
          // Approximated as: last-3-years average + quadratic acceleration of -0.45/yr^2
          const dy = t - 1988;
          out[i] = 90.1 - 6.0 * dy - 0.22 * dy * dy;
          break;
        }
        case "rdd": {
          // Piecewise: pre-trend slope -1.78, post-jump -20.06, post-slope -1.49 extra.
          // Counterfactual = pre-period line extrapolated forward.
          out[i] = 98.42 - 1.78 * (t - POLICY_YR);
          break;
        }
        case "scm": {
          // Synthetic Control counterfactual: hand-tabulated approximate values
          // from the post's analysis.R (table_sc_outcomes_long.csv would have exact)
          // gives roughly +18.7 above observed each year on average.
          const gap = [ -0.5, 0.5, 4.6, 7.3, 12.4, 16.6, 19.5, 22.7, 24.1, 28.4, 32.3, 39.4 ];
          out[i] = CA_OBS[i] + gap[i - 19];
          break;
        }
        case "bsts": {
          // CausalImpact full-covariate mean prediction roughly +12.8 above observed.
          const gap = [ 2, 4, 6, 8, 11, 13, 14, 15, 16, 17, 19, 22 ];
          out[i] = CA_OBS[i] + gap[i - 19];
          break;
        }
      }
    }
    return out;
  }

  function attFromCounterfactual(cf) {
    let s = 0, n = 0;
    for (let i = 0; i < CA_YEARS.length; i++) {
      if (CA_YEARS[i] >= POLICY_YR && cf[i] !== null) {
        s += (CA_OBS[i] - cf[i]);
        n++;
      }
    }
    return n ? s / n : null;
  }

  const METHOD_LABELS = {
    naive: "Naive pre-post · CF = California's 1970-1988 mean (116 packs)",
    did:   "DiD vs Nevada · CF = California pre-mean + Nevada's pre-to-post change (-21.3 packs)",
    its_growth: "ITS growth curve · CF = linear extrapolation of California's 1970-1988 trend",
    its_arima:  "ITS ARIMA(1,2,0) · CF bends below the observed series — flips the sign",
    rdd:   "RDD on time · CF = extrapolated pre-period segmented line",
    scm:   "Synthetic Control · CF = weighted blend of Utah 34% + Nevada 24% + Montana 18% + Colorado 17% + Connecticut 6%",
    bsts:  "CausalImpact (BSTS) · CF = Bayesian posterior mean from donor-state predictors",
  };

  function makeIntroChart(container) {
    const W = 880, H = 360;
    const m = { top: 20, right: 24, bottom: 40, left: 50 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3.scaleLinear().domain([1970, 2000]).range([m.left, W - m.right]);
    const y = d3.scaleLinear().domain([20, 145]).range([H - m.bottom, m.top]);

    // Axes
    svg.append("g").attr("transform", `translate(0,${H - m.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => String(d)).ticks(8))
      .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
    svg.append("g").attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(y).ticks(6))
      .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
    svg.selectAll(".domain, .tick line").attr("stroke", C.muted);

    // Axis labels
    svg.append("text").attr("x", W / 2).attr("y", H - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11).text("year");
    svg.append("text")
      .attr("transform", `translate(12,${(H - m.bottom + m.top) / 2}) rotate(-90)`)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .text("per-capita cigarette sales (packs)");

    // Policy threshold
    svg.append("line").attr("x1", x(POLICY_YR - 0.5)).attr("x2", x(POLICY_YR - 0.5))
      .attr("y1", m.top).attr("y2", H - m.bottom)
      .attr("stroke", C.orange).attr("stroke-dasharray", "4 3").attr("stroke-width", 1);
    svg.append("text").attr("x", x(POLICY_YR - 0.5) + 6).attr("y", m.top + 12)
      .attr("fill", C.orange).attr("font-size", 11).attr("font-weight", 600).text("Proposition 99 →");

    // Observed line
    const lineGen = d3.line()
      .x((d, i) => x(CA_YEARS[i]))
      .y(d => y(d));
    svg.append("path")
      .attr("class", "observed")
      .attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.5)
      .attr("d", lineGen(CA_OBS));

    // Observed dots
    svg.append("g").attr("class", "observed-dots").selectAll("circle")
      .data(CA_OBS).enter().append("circle")
      .attr("cx", (d, i) => x(CA_YEARS[i]))
      .attr("cy", d => y(d))
      .attr("r", 2.5)
      .attr("fill", C.orange);

    // Counterfactual line + shaded gap
    const cfLayer = svg.append("g").attr("class", "cf-layer");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${m.left + 12},${m.top + 8})`);
    legend.append("rect").attr("x", -8).attr("y", -10).attr("width", 230).attr("height", 36)
      .attr("fill", "rgba(15,23,41,0.7)").attr("stroke", C.faint).attr("rx", 4);
    legend.append("line").attr("x1", 0).attr("x2", 22).attr("y1", 0).attr("y2", 0)
      .attr("stroke", C.orange).attr("stroke-width", 2.5);
    legend.append("text").attr("x", 28).attr("y", 4).attr("fill", C.text).attr("font-size", 11)
      .text("California observed");
    legend.append("line").attr("x1", 0).attr("x2", 22).attr("y1", 18).attr("y2", 18)
      .attr("stroke", C.teal).attr("stroke-width", 2.2).attr("stroke-dasharray", "5 3");
    legend.append("text").attr("x", 28).attr("y", 22).attr("fill", C.text).attr("font-size", 11)
      .text("Counterfactual (selected method)");

    // ATT text
    const attText = svg.append("text").attr("x", W - m.right - 6).attr("y", m.top + 14)
      .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 13)
      .attr("font-weight", 600).text("");

    function update(method) {
      const cf = counterfactual(method);
      cfLayer.selectAll("*").remove();

      // Build gap area between observed and CF for post-period only
      const postIdx = CA_YEARS.map((t, i) => t >= POLICY_YR ? i : null).filter(v => v !== null);
      const gapData = postIdx.map(i => ({ t: CA_YEARS[i], obs: CA_OBS[i], cf: cf[i] }));
      const area = d3.area()
        .x(d => x(d.t))
        .y0(d => y(d.cf))
        .y1(d => y(d.obs));
      cfLayer.append("path")
        .attr("d", area(gapData))
        .attr("fill", C.teal)
        .attr("opacity", 0.15);

      cfLayer.append("path")
        .attr("fill", "none")
        .attr("stroke", C.teal).attr("stroke-width", 2.2)
        .attr("stroke-dasharray", "5 3")
        .attr("d", lineGen(cf));
      cfLayer.append("g").selectAll("circle")
        .data(cf).enter().append("circle")
        .attr("cx", (d, i) => x(CA_YEARS[i]))
        .attr("cy", d => d === null ? null : y(d))
        .attr("display", d => d === null ? "none" : null)
        .attr("r", 2)
        .attr("fill", C.teal);

      const att = attFromCounterfactual(cf);
      attText.text(att === null ? "" : `Estimated ATT = ${att.toFixed(1)} packs / capita / year`);
      attText.attr("fill", att < 0 ? C.teal : C.orange);
    }

    return { update };
  }

  const introChart = makeIntroChart(document.getElementById("intro-anim"));
  function setIntroMethod(method) {
    introChart.update(method);
    document.getElementById("intro-method-note").textContent = METHOD_LABELS[method] || "";
  }
  document.querySelectorAll("#intro-methods input").forEach(el => {
    el.addEventListener("change", e => { if (e.target.checked) setIntroMethod(e.target.value); });
  });
  setIntroMethod("naive");

  // =============================================================================
  // TAB 2 — Counterfactual Simulator (single run)
  // =============================================================================
  // Mulberry32 RNG via DGP module
  const RNG = DGP;

  function simulatePanel(opts) {
    // Generate a J+1 state, T-year panel with a fixed pre-period mean per state,
    // a shared secular trend, idiosyncratic state-level trends, year noise,
    // and a treatment effect for the treated unit (index 0) starting at year >= 0.
    const { J, T, T_pre, sd, asym, att, secularTrend, seed } = opts;
    const rng = RNG.mulberry32(seed | 0 || 1);
    const norm = RNG.makeNormal(rng); // standard normal draws
    const N = J + 1;
    const states = []; // each: { mean0, trend, y[T] }
    for (let s = 0; s < N; s++) {
      const mean0 = 100 + 20 * norm();
      // Trend: secularTrend (negative) + per-state perturbation
      const trend = secularTrend + 0.4 * norm();
      states.push({ mean0, trend, y: new Float64Array(T) });
    }
    // For the chosen "single control" (state index 1), set its trend deliberately
    // so that asym controls how strongly it follows California's secular trend.
    // asym = 0 ⇒ control trend mirrors CA's secular trend exactly.
    // asym = 1 ⇒ control trend = -secularTrend (opposite direction).
    states[1].trend = (1 - 2 * asym) * secularTrend;
    // Generate outcome paths
    for (let s = 0; s < N; s++) {
      const st = states[s];
      for (let t = 0; t < T; t++) {
        let v = st.mean0 + st.trend * t + sd * norm();
        if (s === 0 && t >= T_pre) v += att;
        st.y[t] = v;
      }
    }
    return { states, J, T, T_pre, att };
  }

  function naiveEstimate(panel) {
    const { states, T, T_pre } = panel;
    const ca = states[0].y;
    let pre = 0, post = 0;
    for (let t = 0; t < T_pre; t++) pre += ca[t];
    for (let t = T_pre; t < T; t++) post += ca[t];
    return (post / (T - T_pre)) - (pre / T_pre);
  }

  function didEstimate(panel) {
    const { states, T, T_pre } = panel;
    const ca = states[0].y, nv = states[1].y;
    const caPre = d3.mean(ca.slice(0, T_pre)), caPost = d3.mean(ca.slice(T_pre));
    const nvPre = d3.mean(nv.slice(0, T_pre)), nvPost = d3.mean(nv.slice(T_pre));
    return (caPost - caPre) - (nvPost - nvPre);
  }

  function scmStyleEstimate(panel) {
    // "SCM-style" = equal-weight average of all J donor states' pre→post change,
    // subtracted from California's. (A proxy for synthetic control: by averaging
    // many donors we wash out idiosyncratic donor noise. Equal weights are the
    // simplest illustration; tidysynth would use convex constrained weights.)
    const { states, T, T_pre, J } = panel;
    const ca = states[0].y;
    const caPre = d3.mean(ca.slice(0, T_pre)), caPost = d3.mean(ca.slice(T_pre));
    let donorPreSum = 0, donorPostSum = 0;
    for (let s = 1; s <= J; s++) {
      const yy = states[s].y;
      donorPreSum += d3.mean(yy.slice(0, T_pre));
      donorPostSum += d3.mean(yy.slice(T_pre));
    }
    const donorChange = (donorPostSum - donorPreSum) / J;
    return (caPost - caPre) - donorChange;
  }

  function makeSimChart(container) {
    const W = 880, H = 320;
    const m = { top: 14, right: 24, bottom: 36, left: 50 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const x = d3.scaleLinear().range([m.left, W - m.right]);
    const y = d3.scaleLinear().range([H - m.bottom, m.top]);
    const xAxis = svg.append("g").attr("transform", `translate(0,${H - m.bottom})`);
    const yAxis = svg.append("g").attr("transform", `translate(${m.left},0)`);
    const policyLine = svg.append("line").attr("stroke", C.orange)
      .attr("stroke-dasharray", "4 3").attr("stroke-width", 1);
    svg.append("text").attr("x", W / 2).attr("y", H - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11).text("year (centred at policy)");
    svg.append("text").attr("transform", `translate(12,${(H - m.bottom + m.top) / 2}) rotate(-90)`)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11).text("outcome (packs)");
    const donorsLayer = svg.append("g").attr("class", "donors-layer");
    const caLayer = svg.append("g").attr("class", "ca-layer");
    const controlLayer = svg.append("g").attr("class", "control-layer");

    function update(panel) {
      const { states, T, T_pre } = panel;
      x.domain([-T_pre, T - T_pre - 1]);
      let minV = Infinity, maxV = -Infinity;
      for (const s of states) for (let t = 0; t < T; t++) {
        if (s.y[t] < minV) minV = s.y[t]; if (s.y[t] > maxV) maxV = s.y[t];
      }
      y.domain([minV - 5, maxV + 5]);
      xAxis.call(d3.axisBottom(x).ticks(8));
      yAxis.call(d3.axisLeft(y).ticks(6));
      xAxis.selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      yAxis.selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      svg.selectAll(".domain, .tick line").attr("stroke", C.muted);

      policyLine.attr("x1", x(0)).attr("x2", x(0)).attr("y1", m.top).attr("y2", H - m.bottom);

      const line = d3.line().x((d, i) => x(i - T_pre)).y(d => y(d));

      donorsLayer.selectAll("path").remove();
      for (let s = 2; s < states.length; s++) {
        donorsLayer.append("path")
          .attr("fill", "none").attr("stroke", C.steel).attr("stroke-opacity", 0.18)
          .attr("stroke-width", 1).attr("d", line(states[s].y));
      }
      controlLayer.selectAll("*").remove();
      controlLayer.append("path")
        .attr("fill", "none").attr("stroke", C.teal).attr("stroke-width", 2)
        .attr("d", line(states[1].y));
      controlLayer.append("text").attr("x", W - m.right - 4).attr("y", y(states[1].y[T - 1]) - 4)
        .attr("text-anchor", "end").attr("fill", C.teal).attr("font-size", 11).text("single control");

      caLayer.selectAll("*").remove();
      caLayer.append("path")
        .attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.5)
        .attr("d", line(states[0].y));
      caLayer.append("text").attr("x", W - m.right - 4).attr("y", y(states[0].y[T - 1]) + 14)
        .attr("text-anchor", "end").attr("fill", C.orange).attr("font-size", 11).text("treated (California)");
    }

    return { update };
  }

  const simState = { J: 20, T: 30, T_pre: 18, sd: 3.0, asym: 0.30, att: -15, secularTrend: -1.5, seed: 7 };
  const simChart = makeSimChart(document.getElementById("sim-series"));

  function simRun() {
    const panel = simulatePanel(simState);
    simChart.update(panel);
    const naive = naiveEstimate(panel);
    const did   = didEstimate(panel);
    const scm   = scmStyleEstimate(panel);
    document.getElementById("sim-stat-true").textContent  = simState.att.toFixed(1);
    document.getElementById("sim-stat-naive").textContent = naive.toFixed(2);
    document.getElementById("sim-stat-did").textContent   = did.toFixed(2);
    document.getElementById("sim-stat-scm").textContent   = scm.toFixed(2);
  }
  const onSimChange = debounce(simRun, 80);
  function bindRange(id, key, prec) {
    const el = document.getElementById(id);
    const val = document.getElementById(id + "-val");
    el.addEventListener("input", e => {
      simState[key] = +e.target.value;
      val.textContent = prec ? (+e.target.value).toFixed(prec) : e.target.value;
      onSimChange();
    });
  }
  bindRange("sim-j", "J", 0);
  bindRange("sim-att", "att", 0);
  bindRange("sim-sd", "sd", 1);
  bindRange("sim-asym", "asym", 2);
  document.getElementById("sim-reseed").addEventListener("click", () => {
    simState.seed = Math.floor(Math.random() * 1e9) + 1; simRun();
  });
  document.getElementById("sim-reset").addEventListener("click", () => {
    simState.J = 20; simState.att = -15; simState.sd = 3.0; simState.asym = 0.30; simState.seed = 7;
    document.getElementById("sim-j").value = 20;     document.getElementById("sim-j-val").textContent = "20";
    document.getElementById("sim-att").value = -15;  document.getElementById("sim-att-val").textContent = "-15";
    document.getElementById("sim-sd").value = 3.0;   document.getElementById("sim-sd-val").textContent = "3.0";
    document.getElementById("sim-asym").value = 0.30; document.getElementById("sim-asym-val").textContent = "0.30";
    simRun();
  });
  simRun();

  // =============================================================================
  // TAB 3 — Forest plot (real data) + donor weights bar
  // =============================================================================
  function makeForestPlot(container) {
    const W = 880;
    const margin = { top: 28, right: 24, bottom: 40, left: 170 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} 380`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const colorMap = {
      "Naive pre-post":     C.muted,
      "DiD (vs Nevada)":    C.orange,
      "ITS (growth curve)": C.steel,
      "ITS (ARIMA)":        C.orange,
      "RDD on time":        C.steel,
      "Synthetic Control":  C.teal,
      "CausalImpact":       "#66e5de",
    };
    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    function update(data, methods) {
      const rows = data.filter(d => methods.includes(d.method));
      const W_inner = W - margin.left - margin.right;
      const rowH = 32;
      const innerH = rowH * (rows.length + 0.5);
      const totalH = margin.top + innerH + margin.bottom + 20;
      svg.attr("viewBox", `0 0 ${W} ${totalH}`);
      svg.selectAll("g.plot").remove();
      svg.selectAll("text.axis-label").remove();

      const g = svg.append("g").attr("class", "plot")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      const ext = d3.extent(rows.flatMap(d => [d.ci_lo, d.ci_hi]));
      const xMin = Math.min(0, ext[0] || 0), xMax = Math.max(0, ext[1] || 0);
      const pad = Math.max(0.5, (xMax - xMin) * 0.08);
      const x = d3.scaleLinear().domain([xMin - pad, xMax + pad]).range([0, W_inner]);
      const y = d3.scaleBand().domain(rows.map(d => d.method)).range([0, innerH]).padding(0.4);

      // x axis
      g.append("g").attr("transform", `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".1f")))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // x axis label
      svg.append("text").attr("class", "axis-label")
        .attr("x", margin.left + W_inner / 2).attr("y", totalH - 10)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
        .text("estimated ATT (per-capita packs per year)");

      // Zero line
      g.append("line").attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", innerH)
        .attr("stroke", C.faint).attr("stroke-width", 1).attr("stroke-dasharray", "3 4");

      // Consensus band (-12.8 to -28.3) — five methods
      g.append("rect")
        .attr("x", x(-28.3)).attr("y", 0)
        .attr("width", Math.max(0, x(-12.8) - x(-28.3))).attr("height", innerH)
        .attr("fill", C.teal).attr("opacity", 0.06);
      g.append("text").attr("x", x((-12.8 - 28.3) / 2)).attr("y", -8)
        .attr("text-anchor", "middle").attr("fill", C.teal).attr("font-size", 11)
        .attr("font-style", "italic").text("5-method consensus");

      // Method labels
      rows.forEach(d => {
        svg.append("text").attr("class", "plot")
          .attr("x", margin.left - 10).attr("y", margin.top + y(d.method) + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "end").attr("fill", C.text).attr("font-size", 12).text(d.method);
      });

      // CI bars + points
      rows.forEach(d => {
        const yc = y(d.method) + y.bandwidth() / 2;
        const colour = colorMap[d.method] || C.text;
        const row = g.append("g").attr("class", "row").style("cursor", "pointer");
        row.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
          .attr("y1", yc).attr("y2", yc).attr("stroke", colour).attr("stroke-width", 2.2);
        row.append("line").attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
          .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", colour).attr("stroke-width", 2.2);
        row.append("line").attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
          .attr("y1", yc - 5).attr("y2", yc + 5).attr("stroke", colour).attr("stroke-width", 2.2);
        row.append("circle").attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5.5)
          .attr("fill", colour).attr("stroke", "#fff").attr("stroke-width", 1.2);
        row.on("mousemove", function (ev) {
          const rect = container.getBoundingClientRect();
          const ns = d.n_selected;
          tooltip.html(
            `<div><strong style="color:${colour}">${d.method}</strong></div>` +
            `<div><span class='tooltip-key'>estimand =</span> <span class='tooltip-val'>${d.estimand}</span></div>` +
            `<div><span class='tooltip-key'>α̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(2)} packs</span></div>` +
            `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(2)}</span></div>` +
            `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(2)}, ${d.ci_hi.toFixed(2)}]</span></div>` +
            (ns !== null ? `<div><span class='tooltip-key'>donor states =</span> <span class='tooltip-val'>${ns}</span></div>` : "")
          ).classed("show", true)
            .style("left", (ev.clientX - rect.left + 12) + "px")
            .style("top",  (ev.clientY - rect.top  + 12) + "px");
        }).on("mouseleave", function () { tooltip.classed("show", false); });
      });
    }
    return { update };
  }

  function makeDonorBars(container, donors) {
    const W = 880, H = 260;
    const m = { top: 20, right: 24, bottom: 40, left: 130 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    const filtered = donors.filter(d => d.weight >= 0.001).sort((a, b) => b.weight - a.weight);
    const y = d3.scaleBand().domain(filtered.map(d => d.donor))
      .range([m.top, H - m.bottom]).padding(0.25);
    const x = d3.scaleLinear().domain([0, d3.max(filtered, d => d.weight) * 1.1])
      .range([m.left, W - m.right]);

    svg.append("g").attr("transform", `translate(0,${H - m.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%")))
      .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
    svg.append("g").attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text").attr("fill", C.text).attr("font-size", 12);
    svg.selectAll(".domain, .tick line").attr("stroke", C.muted);
    svg.append("text").attr("x", (m.left + W - m.right) / 2).attr("y", H - 6)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .text("donor weight in synthetic California");

    filtered.forEach(d => {
      svg.append("rect")
        .attr("x", m.left)
        .attr("y", y(d.donor))
        .attr("width", x(d.weight) - m.left)
        .attr("height", y.bandwidth())
        .attr("fill", C.teal).attr("opacity", 0.85);
      svg.append("text").attr("x", x(d.weight) + 6).attr("y", y(d.donor) + y.bandwidth() / 2 + 4)
        .attr("fill", C.text).attr("font-size", 11)
        .text(d3.format(".1%")(d.weight));
    });
  }

  const forestChart = makeForestPlot(document.getElementById("fp-chart"));
  let forestData = null;
  function fpRefresh() {
    if (!forestData) return;
    const methods = Array.from(document.querySelectorAll("#fp-methods input:checked"))
      .map(el => el.value);
    forestChart.update(forestData.estimates, methods);
  }
  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", fpRefresh);
  });

  fetch("data/results.json").then(r => r.json()).then(data => {
    forestData = data;
    fpRefresh();
    makeDonorBars(document.getElementById("fp-donors"), data.selection);
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // =============================================================================
  // TAB 4 — Bias & Variance Lab
  // =============================================================================
  const bvState = { J: 20, T: 30, T_pre: 18, sd: 3.0, asym: 0.30, att: -15, secularTrend: -1.5, seed: 7 };
  function bvBind(id, key, prec) {
    const el = document.getElementById(id);
    const val = document.getElementById(id + "-val");
    el.addEventListener("input", e => {
      bvState[key] = +e.target.value;
      val.textContent = prec ? (+e.target.value).toFixed(prec) : e.target.value;
    });
  }
  bvBind("bv-j", "J", 0);
  bvBind("bv-att", "att", 0);
  bvBind("bv-sd", "sd", 1);
  bvBind("bv-asym", "asym", 2);

  function makeHistChart(container) {
    const W = 880, H = 280;
    const m = { top: 28, right: 24, bottom: 40, left: 50 };
    const svg = d3.select(container).html("").append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    function update(data, attTrue) {
      const all = [...data.naive, ...data.did, ...data.scm];
      const ext = d3.extent(all);
      const pad = Math.max(2, (ext[1] - ext[0]) * 0.08);
      const x = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([m.left, W - m.right]);
      const bins = d3.bin().domain(x.domain()).thresholds(28);
      const naive = bins(data.naive), did = bins(data.did), scm = bins(data.scm);
      const maxC = Math.max(d3.max(naive, b => b.length), d3.max(did, b => b.length), d3.max(scm, b => b.length), 1);
      const y = d3.scaleLinear().domain([0, maxC * 1.05]).range([H - m.bottom, m.top]);
      svg.selectAll("*").remove();
      svg.append("g").attr("transform", `translate(0,${H - m.bottom})`).call(d3.axisBottom(x).ticks(8))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      svg.append("g").attr("transform", `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5))
        .selectAll("text").attr("fill", C.muted).attr("font-size", 10);
      svg.selectAll(".domain, .tick line").attr("stroke", C.muted);
      svg.append("text").attr("x", W / 2).attr("y", H - 6)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11).text("estimated α̂ (packs)");
      svg.append("text").attr("transform", `translate(12,${(H - m.bottom + m.top) / 2}) rotate(-90)`)
        .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11).text("count over 100 sims");

      function drawBins(b, colour, opacity) {
        svg.append("g").selectAll("rect").data(b).enter().append("rect")
          .attr("x", d => x(d.x0) + 1)
          .attr("y", d => y(d.length))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("height", d => y(0) - y(d.length))
          .attr("fill", colour).attr("opacity", opacity);
      }
      drawBins(naive, C.muted, 0.5);
      drawBins(did, C.orange, 0.55);
      drawBins(scm, C.teal, 0.65);

      svg.append("line").attr("x1", x(attTrue)).attr("x2", x(attTrue))
        .attr("y1", m.top).attr("y2", H - m.bottom)
        .attr("stroke", "#fff").attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
      svg.append("text").attr("x", x(attTrue)).attr("y", m.top - 6)
        .attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 11)
        .attr("font-weight", 600).text(`true α = ${attTrue}`);

      // Legend
      const legend = svg.append("g").attr("transform", `translate(${W - m.right - 180},${m.top - 6})`);
      legend.append("rect").attr("width", 16).attr("height", 8).attr("fill", C.muted).attr("opacity", 0.5);
      legend.append("text").attr("x", 22).attr("y", 8).attr("fill", C.text).attr("font-size", 11).text("Naive");
      legend.append("rect").attr("x", 60).attr("width", 16).attr("height", 8).attr("fill", C.orange).attr("opacity", 0.55);
      legend.append("text").attr("x", 80).attr("y", 8).attr("fill", C.text).attr("font-size", 11).text("DiD");
      legend.append("rect").attr("x", 118).attr("width", 16).attr("height", 8).attr("fill", C.teal).attr("opacity", 0.65);
      legend.append("text").attr("x", 138).attr("y", 8).attr("fill", C.text).attr("font-size", 11).text("SCM-style");
    }
    return { update };
  }

  const bvHist = makeHistChart(document.getElementById("bv-hist"));

  document.getElementById("bv-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#bv-progress > div");
    const progLabel = document.getElementById("bv-progress-label");
    const histEl = document.getElementById("bv-hist");
    const histStats = document.getElementById("bv-hist-stats");

    const N_SIMS = 100;
    const naiveA = [], didA = [], scmA = [];
    let i = 0;

    function step() {
      const batch = 4;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const panel = simulatePanel({ ...bvState, seed: bvState.seed + i + 1 });
        naiveA.push(naiveEstimate(panel));
        didA.push(didEstimate(panel));
        scmA.push(scmStyleEstimate(panel));
      }
      const pct = (i / N_SIMS) * 100;
      progBar.style.width = pct + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        bvHist.update({ naive: naiveA, did: didA, scm: scmA }, bvState.att);
        document.getElementById("bv-naive-mean").textContent =
          `${d3.mean(naiveA).toFixed(2)} (${d3.deviation(naiveA).toFixed(2)})`;
        document.getElementById("bv-did-mean").textContent =
          `${d3.mean(didA).toFixed(2)} (${d3.deviation(didA).toFixed(2)})`;
        document.getElementById("bv-scm-mean").textContent =
          `${d3.mean(scmA).toFixed(2)} (${d3.deviation(scmA).toFixed(2)})`;
        document.getElementById("bv-true-mean").textContent = bvState.att.toFixed(1);
        btn.disabled = false;
      }
    }
    step();
  });

  // ---- Global error handler --------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
