// app.js — wires the DOM controls for the python_did101 web app.
// Runs after window.DGP, window.LASSO, window.CHARTS are defined.

(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Tab switching.
  // ------------------------------------------------------------------
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
  document.querySelectorAll(".cta-card").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
    // Keyboard activation for role="button" cards
    card.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        activateTab(card.dataset.goto);
      }
    });
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // TAB 1 — parallel-trends / treatment-jump animation.
  // We reuse the L1-vs-L2 chart-builder for now (its visual contract
  // — two interlocking curves with markers — matches the parallel-trends
  // metaphor reasonably well). Future enhancement: dedicated
  // parallel_trends_animation chart-builder.
  // ------------------------------------------------------------------
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — DiD Simulator.
  //
  // DGP (2x2 panel):
  //   Y_{ig,t} = mu_g + tau*post_t + ATT*(post_t * treat_g) + eps
  //   mu_treated = 60, mu_control = 71 (mimics the post's baseline gap)
  //   tau = secular trend slider
  //   ATT = true ATT slider
  //   eps ~ N(0, sigma^2)
  //
  // Estimators:
  //   Naive  = mean(treated, post) - mean(treated, pre)
  //   DiD    = (mean(treated, post) - mean(treated, pre))
  //          - (mean(control, post) - mean(control, pre))
  // ------------------------------------------------------------------
  const sim = {
    att: 25.0, trend: 10.0, noise: 2.0, n: 35, seed: 42,
    cmp: null, // set below to chart instance
  };

  // Build a small bespoke chart for "naive vs DiD vs true ATT" — a horizontal
  // bar chart with a vertical reference line at the true ATT. Mirrors the
  // alpha_compare contract.
  function did_compare_chart(container) {
    const C = {
      bg: "#1f2b5e", steel: "#6a9bcc", orange: "#d97757",
      teal: "#00d4c8", text: "#e8ecf2", muted: "#8b9dc3",
      grid: "rgba(232, 236, 242, 0.10)",
    };
    const W = 720, H = 260;
    const margin = { top: 30, right: 40, bottom: 50, left: 130 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w / 2},${h + 36})`)
      .attr("text-anchor", "middle")
      .attr("fill", C.text)
      .attr("font-size", 12)
      .text("Estimated effect (GPA points)");

    return {
      update({ naive, did, att_true, naive_lo, naive_hi, did_lo, did_hi }) {
        g.selectAll("*").remove();
        const rows = [
          { name: "Naive Before-After", est: naive, lo: naive_lo, hi: naive_hi, color: C.orange },
          { name: "DiD (manual)",        est: did,   lo: did_lo,   hi: did_hi,   color: C.teal },
        ];
        const xmin = Math.min(att_true - 2, ...rows.map(r => Number.isFinite(r.lo) ? r.lo : r.est) ) - 2;
        const xmax = Math.max(att_true + 2, ...rows.map(r => Number.isFinite(r.hi) ? r.hi : r.est)) + 2;
        const x = d3.scaleLinear().domain([xmin, xmax]).range([0, w]);
        const y = d3.scaleBand().domain(rows.map(r => r.name)).range([0, h]).padding(0.4);

        // Axes
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(6))
          .selectAll("text").attr("fill", C.muted);
        g.append("g").call(d3.axisLeft(y))
          .selectAll("text").attr("fill", C.text).attr("font-size", 12);
        g.selectAll(".domain, .tick line").attr("stroke", C.muted);

        // Grid lines
        g.selectAll(".grid-x")
          .data(x.ticks(6))
          .enter().append("line")
          .attr("x1", d => x(d)).attr("x2", d => x(d))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.grid);

        // True-ATT reference line
        g.append("line")
          .attr("x1", x(att_true)).attr("x2", x(att_true))
          .attr("y1", -5).attr("y2", h + 5)
          .attr("stroke", C.text).attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
        g.append("text")
          .attr("x", x(att_true)).attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", C.text)
          .attr("font-size", 11)
          .text(`true ATT = ${att_true.toFixed(2)}`);

        // CI bars
        rows.forEach(r => {
          if (Number.isFinite(r.lo) && Number.isFinite(r.hi)) {
            g.append("line")
              .attr("x1", x(r.lo)).attr("x2", x(r.hi))
              .attr("y1", y(r.name) + y.bandwidth() / 2)
              .attr("y2", y(r.name) + y.bandwidth() / 2)
              .attr("stroke", r.color).attr("stroke-width", 3);
          }
          if (Number.isFinite(r.est)) {
            g.append("circle")
              .attr("cx", x(r.est)).attr("cy", y(r.name) + y.bandwidth() / 2)
              .attr("r", 7).attr("fill", r.color);
            g.append("text")
              .attr("x", x(r.est)).attr("y", y(r.name) + y.bandwidth() / 2 - 14)
              .attr("text-anchor", "middle")
              .attr("fill", r.color).attr("font-size", 11)
              .text(r.est.toFixed(2));
          }
        });
      }
    };
  }

  // Histogram chart for many-simulation Monte Carlo (mirrors alpha_histograms).
  function did_histograms_chart(container) {
    const C = {
      orange: "#d97757", teal: "#00d4c8", text: "#e8ecf2",
      muted: "#8b9dc3", grid: "rgba(232, 236, 242, 0.10)",
    };
    // Increased right margin so the legend can sit OUTSIDE the plot area
    // (avoids the legend rectangle overlapping the histogram bars).
    const W = 720, H = 320;
    const margin = { top: 24, right: 170, bottom: 50, left: 50 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    return {
      update({ naive_arr, did_arr, att_true }) {
        g.selectAll("*").remove();
        const all = naive_arr.concat(did_arr);
        const xmin = Math.min(att_true - 1, d3.min(all)) - 1;
        const xmax = Math.max(att_true + 1, d3.max(all)) + 1;
        const x = d3.scaleLinear().domain([xmin, xmax]).range([0, w]);
        const bins = 24;
        const hist = d3.bin().domain(x.domain()).thresholds(bins);
        const naiveBins = hist(naive_arr);
        const didBins = hist(did_arr);
        const ymax = Math.max(d3.max(naiveBins, d => d.length), d3.max(didBins, d => d.length));
        const y = d3.scaleLinear().domain([0, ymax * 1.1]).range([h, 0]);

        // Axes
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(8))
          .selectAll("text").attr("fill", C.muted);
        g.append("g").call(d3.axisLeft(y).ticks(5))
          .selectAll("text").attr("fill", C.muted);
        g.selectAll(".domain, .tick line").attr("stroke", C.muted);

        g.append("text")
          .attr("transform", `translate(${w / 2},${h + 38})`)
          .attr("text-anchor", "middle")
          .attr("fill", C.text)
          .attr("font-size", 12)
          .text("Estimated effect across 100 simulations");
        g.append("text")
          .attr("transform", `rotate(-90) translate(${-h / 2},${-36})`)
          .attr("text-anchor", "middle")
          .attr("fill", C.text)
          .attr("font-size", 12)
          .text("Count");

        // Naive histogram (orange, translucent)
        g.selectAll(".bar-naive")
          .data(naiveBins).enter().append("rect")
          .attr("class", "bar-naive")
          .attr("x", d => x(d.x0))
          .attr("y", d => y(d.length))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("height", d => h - y(d.length))
          .attr("fill", C.orange).attr("opacity", 0.55);
        // DiD histogram (teal)
        g.selectAll(".bar-did")
          .data(didBins).enter().append("rect")
          .attr("class", "bar-did")
          .attr("x", d => x(d.x0))
          .attr("y", d => y(d.length))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("height", d => h - y(d.length))
          .attr("fill", C.teal).attr("opacity", 0.55);

        // True-ATT reference
        g.append("line")
          .attr("x1", x(att_true)).attr("x2", x(att_true))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.text).attr("stroke-width", 2).attr("stroke-dasharray", "4 4");
        g.append("text")
          .attr("x", x(att_true)).attr("y", -6)
          .attr("text-anchor", "middle")
          .attr("fill", C.text).attr("font-size", 11)
          .text(`true ATT = ${att_true.toFixed(2)}`);

        // Legend — placed OUTSIDE the plot area (in the right margin) so it
        // never overlaps the histogram bars.
        const lg = g.append("g").attr("transform", `translate(${w + 14},${10})`);
        lg.append("rect").attr("x", 0).attr("y", 8).attr("width", 14).attr("height", 10).attr("fill", C.orange).attr("opacity", 0.65);
        lg.append("text").attr("x", 20).attr("y", 17).attr("fill", C.text).attr("font-size", 11).text("Naive Before-After");
        lg.append("rect").attr("x", 0).attr("y", 28).attr("width", 14).attr("height", 10).attr("fill", C.teal).attr("opacity", 0.85);
        lg.append("text").attr("x", 20).attr("y", 37).attr("fill", C.text).attr("font-size", 11).text("DiD (manual)");
      }
    };
  }

  sim.cmp = did_compare_chart(document.getElementById("sim-compare"));
  sim.hist = did_histograms_chart(document.getElementById("sim-hist"));

  // One simulation of the 2x2 panel.
  function simulate_did_once(opts) {
    const { att, trend, noise, n, seed } = opts;
    const rng = window.DGP.mulberry32(seed);
    const normal = window.DGP.makeNormal(rng);
    // Means: control = 71.22, treated = 60.17 (mimic the post)
    const mu_c = 71.22, mu_t = 60.17;

    // Generate 4 cells: (group, period) x n observations each.
    const c_pre = [], c_post = [], t_pre = [], t_post = [];
    for (let i = 0; i < n; i++) {
      c_pre.push(mu_c + 0 + 0 + noise * normal());
      c_post.push(mu_c + trend + 0 + noise * normal());
      t_pre.push(mu_t + 0 + 0 + noise * normal());
      t_post.push(mu_t + trend + att + noise * normal());
    }
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const sd = arr => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1));
    };
    const mc_pre = mean(c_pre), mc_post = mean(c_post),
          mt_pre = mean(t_pre), mt_post = mean(t_post);

    const naive = mt_post - mt_pre;
    const did = (mt_post - mt_pre) - (mc_post - mc_pre);

    // SE for naive: SE of a difference of two means in the same (treated) group
    const sd_t_pre = sd(t_pre), sd_t_post = sd(t_post);
    const sd_c_pre = sd(c_pre), sd_c_post = sd(c_post);
    const naive_se = Math.sqrt((sd_t_pre ** 2 + sd_t_post ** 2) / n);
    // SE for DiD: SE of a difference of two differences (4 independent means)
    const did_se = Math.sqrt(
      (sd_t_pre ** 2 + sd_t_post ** 2 + sd_c_pre ** 2 + sd_c_post ** 2) / n
    );
    return {
      naive, did, naive_se, did_se,
      naive_lo: naive - 1.96 * naive_se, naive_hi: naive + 1.96 * naive_se,
      did_lo: did - 1.96 * did_se, did_hi: did + 1.96 * did_se,
    };
  }

  function sim_refit() {
    const r = simulate_did_once({
      att: sim.att, trend: sim.trend, noise: sim.noise, n: sim.n, seed: sim.seed,
    });
    sim.last = r;
    document.getElementById("sim-naive-est").textContent = r.naive.toFixed(2);
    document.getElementById("sim-naive-se").textContent = r.naive_se.toFixed(3);
    document.getElementById("sim-naive-bias").textContent = (r.naive - sim.att).toFixed(2);
    document.getElementById("sim-did-est").textContent = r.did.toFixed(2);
    document.getElementById("sim-did-se").textContent = r.did_se.toFixed(3);
    document.getElementById("sim-did-bias").textContent = (r.did - sim.att).toFixed(2);
    sim.cmp.update({
      naive: r.naive, did: r.did, att_true: sim.att,
      naive_lo: r.naive_lo, naive_hi: r.naive_hi,
      did_lo: r.did_lo, did_hi: r.did_hi,
    });
  }

  const onSimParam = debounce(sim_refit, 100);
  document.getElementById("sim-att").addEventListener("input", e => {
    sim.att = +e.target.value;
    document.getElementById("sim-att-val").textContent = sim.att.toFixed(2);
    onSimParam();
  });
  document.getElementById("sim-trend").addEventListener("input", e => {
    sim.trend = +e.target.value;
    document.getElementById("sim-trend-val").textContent = sim.trend.toFixed(2);
    onSimParam();
  });
  document.getElementById("sim-noise").addEventListener("input", e => {
    sim.noise = +e.target.value;
    document.getElementById("sim-noise-val").textContent = sim.noise.toFixed(2);
    onSimParam();
  });
  document.getElementById("sim-n").addEventListener("input", e => {
    sim.n = +e.target.value;
    document.getElementById("sim-n-val").textContent = sim.n;
    onSimParam();
  });

  document.getElementById("sim-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sim-progress > div");
    const progLabel = document.getElementById("sim-progress-label");
    const histEl = document.getElementById("sim-hist");
    const histStats = document.getElementById("sim-hist-stats");

    const N_SIMS = 100;
    const naive_arr = [];
    const did_arr = [];

    let i = 0;
    function step() {
      const batch = 2;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const r = simulate_did_once({
          att: sim.att, trend: sim.trend, noise: sim.noise,
          n: sim.n, seed: sim.seed + i + 1,
        });
        if (Number.isFinite(r.naive)) naive_arr.push(r.naive);
        if (Number.isFinite(r.did)) did_arr.push(r.did);
      }
      progBar.style.width = (i / N_SIMS * 100) + "%";
      progLabel.textContent = `simulation ${i} / ${N_SIMS}`;
      if (i < N_SIMS) {
        setTimeout(step, 0);
      } else {
        progLabel.textContent = `done (${N_SIMS} simulations)`;
        histEl.style.display = "block";
        histStats.style.display = "grid";
        sim.hist.update({ naive_arr, did_arr, att_true: sim.att });
        document.getElementById("sim-naive-mean").textContent = d3.mean(naive_arr).toFixed(3);
        document.getElementById("sim-naive-sd").textContent = (d3.deviation(naive_arr) ?? 0).toFixed(3);
        document.getElementById("sim-did-mean").textContent = d3.mean(did_arr).toFixed(3);
        document.getElementById("sim-did-sd").textContent = (d3.deviation(did_arr) ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  // Initial fit.
  sim_refit();

  // ------------------------------------------------------------------
  // TAB 3 — Forest plot from real data (results.json).
  // ------------------------------------------------------------------
  const fp = {
    chart: CHARTS.forest_plot(document.getElementById("fp-chart")),
    data: null,
  };

  function fp_refresh() {
    if (!fp.data) return;
    const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
    const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(fp.data.estimates, methods, outcomes);
  }

  document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
    el.addEventListener("change", fp_refresh);
  });

  // ------------------------------------------------------------------
  // TAB 4 — Event-study coefficient plot.
  //
  // The "method" field encodes the event-time (e.g. "Event-Study t=-4").
  // We render a custom chart with x = relative time, y = estimate, error bars
  // for the 95% CI, and a horizontal zero reference line.
  // ------------------------------------------------------------------
  function event_study_chart(container) {
    const C = {
      orange: "#d97757", teal: "#00d4c8", steel: "#6a9bcc",
      text: "#e8ecf2", muted: "#8b9dc3",
      grid: "rgba(232, 236, 242, 0.10)",
    };
    const W = 760, H = 400;
    const margin = { top: 30, right: 30, bottom: 76, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    container.innerHTML = "";
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    return {
      update(rows) {
        g.selectAll("*").remove();
        // Parse "Event-Study t=K" -> integer K
        const points = rows.map(r => {
          const m = r.method.match(/t=(-?\d+)/);
          return m ? { t: +m[1], est: r.estimate, lo: r.ci_lo, hi: r.ci_hi, se: r.se } : null;
        }).filter(Boolean);
        // Insert the omitted reference point at t = -1, est = 0
        if (!points.some(p => p.t === -1)) {
          points.push({ t: -1, est: 0, lo: 0, hi: 0, se: null, ref: true });
        }
        points.sort((a, b) => a.t - b.t);

        const xmin = d3.min(points, d => d.t) - 0.5;
        const xmax = d3.max(points, d => d.t) + 0.5;
        const allY = points.flatMap(p => [p.est, p.lo, p.hi]).filter(Number.isFinite);
        const ymin = Math.min(0, d3.min(allY)) - 2;
        const ymax = d3.max(allY) + 2;
        const x = d3.scaleLinear().domain([xmin, xmax]).range([0, w]);
        const y = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]);

        // Axes
        g.append("g").attr("transform", `translate(0,${h})`)
          .call(d3.axisBottom(x).ticks(points.length).tickFormat(d3.format("d")))
          .selectAll("text").attr("fill", C.muted);
        g.append("g").call(d3.axisLeft(y).ticks(6))
          .selectAll("text").attr("fill", C.muted);
        g.selectAll(".domain, .tick line").attr("stroke", C.muted);

        g.append("text")
          .attr("transform", `translate(${w / 2},${h + 56})`)
          .attr("text-anchor", "middle")
          .attr("fill", C.text)
          .attr("font-size", 12)
          .text("Periods relative to treatment  (t = 0 is the first post-treatment period)");
        g.append("text")
          .attr("transform", `rotate(-90) translate(${-h / 2},${-40})`)
          .attr("text-anchor", "middle")
          .attr("fill", C.text)
          .attr("font-size", 12)
          .text("Estimated coefficient (GPA points)");

        // Grid lines
        g.selectAll(".grid-y")
          .data(y.ticks(6))
          .enter().append("line")
          .attr("x1", 0).attr("x2", w)
          .attr("y1", d => y(d)).attr("y2", d => y(d))
          .attr("stroke", C.grid);

        // Zero reference line
        g.append("line")
          .attr("x1", 0).attr("x2", w)
          .attr("y1", y(0)).attr("y2", y(0))
          .attr("stroke", C.muted).attr("stroke-width", 1).attr("stroke-dasharray", "3 3");

        // Treatment reference line (between t = -1 and t = 0)
        g.append("line")
          .attr("x1", x(-0.5)).attr("x2", x(-0.5))
          .attr("y1", 0).attr("y2", h)
          .attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "5 4");
        // Place "treatment" annotation BELOW the x-axis (in the bottom margin,
        // between the axis tick labels and the axis title) so it never overlaps
        // the post-treatment data labels or CI tops at the top of the plot.
        g.append("text")
          .attr("x", x(-0.5)).attr("y", h + 34)
          .attr("text-anchor", "middle")
          .attr("fill", C.orange).attr("font-size", 11)
          .attr("font-weight", 600)
          .text("treatment");

        // CI error bars
        points.forEach(p => {
          if (p.ref) return;
          if (Number.isFinite(p.lo) && Number.isFinite(p.hi)) {
            g.append("line")
              .attr("x1", x(p.t)).attr("x2", x(p.t))
              .attr("y1", y(p.lo)).attr("y2", y(p.hi))
              .attr("stroke", p.t < 0 ? C.steel : C.teal).attr("stroke-width", 2);
            g.append("line")
              .attr("x1", x(p.t) - 5).attr("x2", x(p.t) + 5)
              .attr("y1", y(p.lo)).attr("y2", y(p.lo))
              .attr("stroke", p.t < 0 ? C.steel : C.teal).attr("stroke-width", 2);
            g.append("line")
              .attr("x1", x(p.t) - 5).attr("x2", x(p.t) + 5)
              .attr("y1", y(p.hi)).attr("y2", y(p.hi))
              .attr("stroke", p.t < 0 ? C.steel : C.teal).attr("stroke-width", 2);
          }
        });

        // Point estimates
        points.forEach(p => {
          const fill = p.ref ? C.muted : (p.t < 0 ? C.steel : C.teal);
          g.append("circle")
            .attr("cx", x(p.t)).attr("cy", y(p.est))
            .attr("r", p.ref ? 5 : 7)
            .attr("fill", fill)
            .attr("stroke", p.ref ? C.text : "none").attr("stroke-width", 1);

          // Estimate label
          g.append("text")
            .attr("x", x(p.t))
            .attr("y", y(p.est) - (p.est >= 0 ? 12 : -18))
            .attr("text-anchor", "middle")
            .attr("fill", fill).attr("font-size", 10)
            .text(p.ref ? "ref" : p.est.toFixed(2));
        });
      }
    };
  }

  const evChart = event_study_chart(document.getElementById("ev-chart"));

  // ------------------------------------------------------------------
  // Load results.json once for tabs 3 + 4.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    fp.data = data;
    fp_refresh();
    const evRows = (data.estimates || []).filter(r => r.outcome === "Event-Study coefficients");
    if (evRows.length > 0) {
      evChart.update(evRows);
    } else {
      document.getElementById("ev-chart").innerHTML =
        '<div style="padding:20px;color:#d97757;">No event-study estimates in results.json.</div>';
    }
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("ev-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
