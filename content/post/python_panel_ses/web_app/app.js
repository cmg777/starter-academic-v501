// app.js — wires DOM controls for the Panel SE companion app.
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
  document.querySelectorAll(".cta-card[data-goto]").forEach(card => {
    card.addEventListener("click", () => activateTab(card.dataset.goto));
  });

  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // TAB 1 — L1/L2 concept animation (decorative, drives the intro).
  // ------------------------------------------------------------------
  CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));

  // ------------------------------------------------------------------
  // TAB 2 — SE Forest plot from results.json.
  // ------------------------------------------------------------------
  // Custom forest plot for a single-outcome multi-method panel.
  // The shared CHARTS.forest_plot assumes the r_double_lasso color
  // scheme; we render here directly so the eight panel-SE rows get
  // model-coloured bars (pooled vs. FE).
  function renderForest(estimates, activeMethods) {
    const container = document.getElementById("fp-chart");
    container.innerHTML = "";
    const W = 880;
    const margin = { top: 28, right: 32, bottom: 44, left: 240 };
    const rows = estimates.filter(d => activeMethods.includes(d.method));
    const rowH = 34;
    const H = margin.top + margin.bottom + rowH * Math.max(rows.length, 1);

    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    if (rows.length === 0) {
      svg.append("text").attr("x", W / 2).attr("y", H / 2)
        .attr("text-anchor", "middle").attr("fill", "#8b9dc3")
        .attr("font-size", 14).text("No methods selected.");
      return;
    }

    const ext = d3.extent(rows.flatMap(d => [d.ci_lo, d.ci_hi]));
    const xMin = Math.min(0, ext[0]);
    const xMax = Math.max(0, ext[1]);
    const pad = Math.max(0.05, (xMax - xMin) * 0.08);
    const x = d3.scaleLinear()
      .domain([xMin - pad, xMax + pad])
      .range([margin.left, W - margin.right]);
    const y = d3.scaleBand()
      .domain(rows.map(d => d.method))
      .range([margin.top, margin.top + rowH * rows.length])
      .padding(0.32);

    // True alpha reference line.
    svg.append("line")
      .attr("x1", x(0.5)).attr("x2", x(0.5))
      .attr("y1", margin.top - 6).attr("y2", margin.top + rowH * rows.length + 6)
      .attr("stroke", "#00d4c8").attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4");
    svg.append("text").attr("x", x(0.5)).attr("y", margin.top - 12)
      .attr("text-anchor", "middle").attr("fill", "#00d4c8")
      .attr("font-size", 11).attr("font-weight", 600)
      .text("true β = 0.5");

    // Zero line.
    svg.append("line")
      .attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", margin.top - 6).attr("y2", margin.top + rowH * rows.length + 6)
      .attr("stroke", "#4a5780").attr("stroke-width", 1).attr("stroke-dasharray", "2 4");

    // x axis.
    svg.append("g")
      .attr("transform", `translate(0,${margin.top + rowH * rows.length + 4})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")))
      .selectAll("text").attr("fill", "#8b9dc3").attr("font-size", 11);
    svg.selectAll(".domain, .tick line").attr("stroke", "#4a5780");

    // x label.
    svg.append("text")
      .attr("x", (margin.left + W - margin.right) / 2)
      .attr("y", H - 8)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("Coefficient on x (true β = 0.5)");

    // Method labels.
    rows.forEach(d => {
      const yc = y(d.method) + y.bandwidth() / 2;
      const isFE = d.method.includes("FE");
      const col = isFE ? "#d97757" : "#6a9bcc";

      svg.append("text")
        .attr("x", margin.left - 12).attr("y", yc + 4)
        .attr("text-anchor", "end").attr("fill", "#e8ecf2").attr("font-size", 12)
        .text(d.method);

      // CI line.
      svg.append("line")
        .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_hi))
        .attr("y1", yc).attr("y2", yc)
        .attr("stroke", col).attr("stroke-width", 2.2);
      // Caps.
      svg.append("line")
        .attr("x1", x(d.ci_lo)).attr("x2", x(d.ci_lo))
        .attr("y1", yc - 5).attr("y2", yc + 5)
        .attr("stroke", col).attr("stroke-width", 2.2);
      svg.append("line")
        .attr("x1", x(d.ci_hi)).attr("x2", x(d.ci_hi))
        .attr("y1", yc - 5).attr("y2", yc + 5)
        .attr("stroke", col).attr("stroke-width", 2.2);
      // Point.
      const pt = svg.append("circle")
        .attr("cx", x(d.estimate)).attr("cy", yc).attr("r", 5)
        .attr("fill", col).attr("stroke", "#fff").attr("stroke-width", 1)
        .style("cursor", "pointer");

      pt.on("mousemove", function (ev) {
        const rect = container.getBoundingClientRect();
        tooltip.html(
          `<div><strong style="color:${col}">${d.method}</strong></div>` +
          `<div><span class='tooltip-key'>β̂ =</span> <span class='tooltip-val'>${d.estimate.toFixed(4)}</span></div>` +
          `<div><span class='tooltip-key'>SE =</span> <span class='tooltip-val'>${d.se.toFixed(4)}</span></div>` +
          `<div><span class='tooltip-key'>t-stat =</span> <span class='tooltip-val'>${d.t.toFixed(2)}</span></div>` +
          `<div><span class='tooltip-key'>95% CI =</span> <span class='tooltip-val'>[${d.ci_lo.toFixed(3)}, ${d.ci_hi.toFixed(3)}]</span></div>`
        ).classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top",  (ev.clientY - rect.top  + 12) + "px");
      }).on("mouseleave", function () { tooltip.classed("show", false); });
    });

    // Legend.
    const legend = svg.append("g").attr("transform", `translate(${margin.left},${H - 22})`);
    legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 5).attr("fill", "#6a9bcc");
    legend.append("text").attr("x", 10).attr("y", 4).attr("fill", "#e8ecf2").attr("font-size", 11)
      .text("Pooled OLS (biased)");
    legend.append("circle").attr("cx", 170).attr("cy", 0).attr("r", 5).attr("fill", "#d97757");
    legend.append("text").attr("x", 180).attr("y", 4).attr("fill", "#e8ecf2").attr("font-size", 11)
      .text("Fixed effects (unbiased)");
  }

  function renderRejection(rates) {
    const container = document.getElementById("rej-chart");
    container.innerHTML = "";
    const W = 880;
    const margin = { top: 28, right: 28, bottom: 88, left: 60 };
    const H = 360;

    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const tooltip = d3.select(container).append("div").attr("class", "tooltip");

    const maxRate = Math.max(0.10, d3.max(rates, d => d.rate) || 0.10) * 1.15;

    const x = d3.scaleBand()
      .domain(rates.map(d => d.model))
      .range([margin.left, W - margin.right])
      .padding(0.30);
    const y = d3.scaleLinear()
      .domain([0, maxRate])
      .range([H - margin.bottom, margin.top]);

    // Nominal 5% reference line.
    svg.append("line")
      .attr("x1", margin.left).attr("x2", W - margin.right)
      .attr("y1", y(0.05)).attr("y2", y(0.05))
      .attr("stroke", "#00d4c8").attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 4");
    svg.append("text")
      .attr("x", W - margin.right - 4).attr("y", y(0.05) - 6)
      .attr("text-anchor", "end").attr("fill", "#00d4c8").attr("font-size", 11)
      .attr("font-weight", 600).text("nominal α = 5%");

    // Y axis.
    svg.append("g").attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".0%")))
      .selectAll("text").attr("fill", "#8b9dc3").attr("font-size", 11);

    // X axis labels (rotated).
    svg.append("g")
      .attr("transform", `translate(0,${H - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("fill", "#e8ecf2").attr("font-size", 11)
      .attr("transform", "rotate(-22)")
      .attr("text-anchor", "end")
      .attr("dy", "0.6em").attr("dx", "-0.5em");

    svg.selectAll(".domain, .tick line").attr("stroke", "#4a5780");

    // Y label.
    svg.append("text")
      .attr("transform", `rotate(-90) translate(${-H / 2},${20})`)
      .attr("text-anchor", "middle").attr("fill", "#e8ecf2").attr("font-size", 12)
      .text("Empirical rejection rate (500 sims)");

    // Bars.
    rates.forEach(d => {
      // Colour by verdict.
      let col = "#6a9bcc";
      if (d.verdict === "over-rejects") col = "#d97757";
      else if (d.verdict === "conservative") col = "#9bdcc3";
      else col = "#00d4c8";

      const bar = svg.append("g").style("cursor", "pointer");
      bar.append("rect")
        .attr("x", x(d.model)).attr("y", y(d.rate))
        .attr("width", x.bandwidth())
        .attr("height", (H - margin.bottom) - y(d.rate))
        .attr("fill", col).attr("opacity", 0.88)
        .attr("rx", 3);
      bar.append("text")
        .attr("x", x(d.model) + x.bandwidth() / 2)
        .attr("y", y(d.rate) - 6)
        .attr("text-anchor", "middle").attr("fill", "#e8ecf2")
        .attr("font-size", 12).attr("font-weight", 600)
        .text((d.rate * 100).toFixed(1) + "%");

      bar.on("mousemove", function (ev) {
        const rect = container.getBoundingClientRect();
        tooltip.html(
          `<div><strong>${d.model}</strong></div>` +
          `<div><span class='tooltip-key'>rejection rate =</span> <span class='tooltip-val'>${(d.rate * 100).toFixed(1)}%</span></div>` +
          `<div><span class='tooltip-key'>rejects =</span> <span class='tooltip-val'>${d.rejects} / ${d.sims}</span></div>` +
          `<div><span class='tooltip-key'>verdict =</span> <span class='tooltip-val'>${d.verdict}</span></div>`
        ).classed("show", true)
          .style("left", (ev.clientX - rect.left + 12) + "px")
          .style("top",  (ev.clientY - rect.top + 12) + "px");
      }).on("mouseleave", function () { tooltip.classed("show", false); });
    });

    // Legend.
    const legend = svg.append("g").attr("transform", `translate(${margin.left + 4},${margin.top + 2})`);
    const items = [
      { col: "#00d4c8",  txt: "~correct (close to 5%)" },
      { col: "#d97757",  txt: "over-rejects (false positives)" },
      { col: "#9bdcc3",  txt: "conservative (wider than needed)" },
    ];
    items.forEach((it, i) => {
      legend.append("rect").attr("x", i * 220).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", it.col);
      legend.append("text").attr("x", i * 220 + 18).attr("y", 10).attr("fill", "#e8ecf2").attr("font-size", 11).text(it.txt);
    });
  }

  // Forest-plot tab wiring.
  let resultsCache = null;

  function refreshForest() {
    if (!resultsCache) return;
    const active = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    renderForest(resultsCache.estimates, active);
  }

  document.querySelectorAll("#fp-methods input").forEach(el => {
    el.addEventListener("change", refreshForest);
  });

  // Load real numbers from results.json.
  fetch("data/results.json").then(r => r.json()).then(data => {
    resultsCache = data;
    refreshForest();
    renderRejection(data.rejection_rates || []);
  }).catch(err => {
    document.getElementById("fp-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
    document.getElementById("rej-chart").innerHTML =
      `<div style="padding:20px;color:#d97757;">Failed to load results.json: ${err}</div>`;
  });

  // ------------------------------------------------------------------
  // TAB 4 — Bias vs Variance Sandbox (DGP simulator, repurposed).
  // ------------------------------------------------------------------
  const sh = {
    n: 200, p: 40, signal: 0.5, asymmetry: 0.80, seed: 7,
    cmp: CHARTS.alpha_compare(document.getElementById("sh-compare")),
    hist: CHARTS.alpha_histograms(document.getElementById("sh-hist")),
  };

  function sh_refit() {
    const sim = DGP.simulate_dl({
      n: sh.n, p: sh.p, signal: sh.signal,
      asymmetry: sh.asymmetry, seed: sh.seed,
    });
    sh.sim = sim;
    const rig = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "rigorous");
    const cvr = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "cv",
                                   { nLam: 50, seed: sh.seed });
    sh.rig = rig; sh.cv = cvr;
    sh_render();
  }

  function fmt(x) { return (x === null || Number.isNaN(x)) ? "—" : x.toFixed(3); }
  function fmt4(x) { return (x === null || Number.isNaN(x)) ? "—" : x.toFixed(4); }

  function sh_render() {
    const r = sh.rig, c = sh.cv;
    document.getElementById("sh-rig-alpha").textContent = fmt(r.alpha_hat);
    document.getElementById("sh-rig-se").textContent    = fmt4(r.se_alpha);
    document.getElementById("sh-rig-iy").textContent    = r.n_Iy;
    document.getElementById("sh-rig-id").textContent    = r.n_Id;
    document.getElementById("sh-rig-un").textContent    = r.n_union;

    document.getElementById("sh-cv-alpha").textContent = fmt(c.alpha_hat);
    document.getElementById("sh-cv-se").textContent    = fmt4(c.se_alpha);
    document.getElementById("sh-cv-iy").textContent    = c.n_Iy;
    document.getElementById("sh-cv-id").textContent    = c.n_Id;
    document.getElementById("sh-cv-un").textContent    = c.n_union;

    sh.cmp.update({
      rigorous: r.alpha_hat,
      cv: c.alpha_hat,
      alpha_true: sh.sim.alpha_true,
    });
  }

  const onShParamChange = debounce(sh_refit, 120);
  document.getElementById("sh-n").addEventListener("input", e => {
    sh.n = +e.target.value;
    document.getElementById("sh-n-val").textContent = sh.n;
    onShParamChange();
  });
  document.getElementById("sh-p").addEventListener("input", e => {
    sh.p = +e.target.value;
    document.getElementById("sh-p-val").textContent = sh.p;
    onShParamChange();
  });
  document.getElementById("sh-s").addEventListener("input", e => {
    sh.signal = +e.target.value;
    document.getElementById("sh-s-val").textContent = sh.signal.toFixed(2);
    onShParamChange();
  });
  document.getElementById("sh-a").addEventListener("input", e => {
    sh.asymmetry = +e.target.value;
    document.getElementById("sh-a-val").textContent = sh.asymmetry.toFixed(2);
    onShParamChange();
  });

  document.getElementById("sh-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const progBar = document.querySelector("#sh-progress > div");
    const progLabel = document.getElementById("sh-progress-label");
    const histEl = document.getElementById("sh-hist");
    const histStats = document.getElementById("sh-hist-stats");

    const N_SIMS = 100;
    const alphas_rig = [];
    const alphas_cv = [];

    let i = 0;
    function step() {
      const batch = 2;
      const end = Math.min(N_SIMS, i + batch);
      for (; i < end; i++) {
        const sim = DGP.simulate_dl({
          n: sh.n, p: sh.p, signal: sh.signal,
          asymmetry: sh.asymmetry, seed: sh.seed + i + 1,
        });
        const r = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "rigorous");
        const c = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "cv",
                                     { nLam: 40, seed: sh.seed + i + 1 });
        if (Number.isFinite(r.alpha_hat)) alphas_rig.push(r.alpha_hat);
        if (Number.isFinite(c.alpha_hat)) alphas_cv.push(c.alpha_hat);
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
        sh.hist.update({
          alphas_rig, alphas_cv,
          alpha_true: sh.sim.alpha_true,
        });
        const meanRig = d3.mean(alphas_rig);
        const meanCV  = d3.mean(alphas_cv);
        const sdRig   = d3.deviation(alphas_rig);
        const sdCV    = d3.deviation(alphas_cv);
        document.getElementById("sh-cv-mean").textContent = (meanCV ?? 0).toFixed(3);
        document.getElementById("sh-cv-sd").textContent   = (sdCV  ?? 0).toFixed(3);
        document.getElementById("sh-rig-mean").textContent = (meanRig ?? 0).toFixed(3);
        document.getElementById("sh-rig-sd").textContent   = (sdRig  ?? 0).toFixed(3);
        btn.disabled = false;
      }
    }
    step();
  });

  // Initial fit.
  sh_refit();

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[panel_ses app] uncaught error:", e.error);
  });
})();
