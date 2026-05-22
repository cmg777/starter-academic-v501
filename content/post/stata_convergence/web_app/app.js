// app.js — wires the DOM controls in index.html to dgp/lasso/charts.
// Runs after window.DGP, window.LASSO, window.CHARTS, and d3 are defined.

(function () {
  "use strict";

  const C = {
    bg:    "#1f2b5e",
    panel: "#182447",
    steel: "#6a9bcc",
    orange:"#d97757",
    teal:  "#00d4c8",
    text:  "#e8ecf2",
    muted: "#8b9dc3",
    line:  "rgba(232, 236, 242, 0.18)",
    grid:  "rgba(232, 236, 242, 0.08)",
    faint: "rgba(232, 236, 242, 0.15)",
  };

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

  function ensureSVG(container, W, H) {
    container.innerHTML = "";
    return d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
  }

  // ------------------------------------------------------------------
  // TAB 1 — β-vs-σ convergence animation.
  //   Two simulated countries (rich + poor) drift toward a common
  //   steady-state, while a tracker on the right shows variance of log
  //   incomes over a small set of countries.
  // ------------------------------------------------------------------
  (function initIntroAnim() {
    const container = document.getElementById("intro-anim");
    if (!container) return;
    const W = 760, H = 320;
    const margin = { top: 28, right: 120, bottom: 44, left: 56 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 60]).range([0, w]);
    const yScale = d3.scaleLinear().domain([6.0, 11.5]).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `t=${d}`))
      .selectAll("text").attr("fill", C.muted);
    g.append("g").call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", C.muted);
    g.selectAll(".domain, .tick line").attr("stroke", C.muted);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Time (years)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-40})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("log GDP per capita");

    // Pre-compute trajectories for a small set of countries.
    function buildPaths(seed) {
      const rng = DGP.mulberry32(seed);
      const normal = DGP.makeNormal(rng);
      const starts = [7.2, 7.8, 8.4, 9.0, 9.6, 10.2, 10.8]; // 7 countries
      const yStar = 10.5; // common steady state
      const beta = 0.012;
      const sigma = 0.05;
      const paths = starts.map(s => {
        const arr = [s];
        for (let t = 1; t <= 60; t++) {
          const prev = arr[t-1];
          const drift = -beta * (prev - yStar);
          const shock = normal() * sigma;
          arr.push(prev + drift + shock);
        }
        return arr;
      });
      return paths;
    }

    let paths = buildPaths(7);
    const lineGen = d3.line().x((_, t) => xScale(t)).y(v => yScale(v)).curve(d3.curveMonotoneX);

    // Draw faint context lines for the other 5 countries.
    paths.forEach((p, i) => {
      if (i !== 0 && i !== 6) {
        g.append("path")
          .attr("d", lineGen(p))
          .attr("fill", "none")
          .attr("stroke", C.faint)
          .attr("stroke-width", 1.2);
      }
    });
    // Bold lines for the poor (index 0) and rich (index 6) trajectories.
    const poorLine = g.append("path").attr("fill", "none")
      .attr("stroke", C.orange).attr("stroke-width", 2.5).attr("opacity", 0.3)
      .attr("d", lineGen(paths[0]));
    const richLine = g.append("path").attr("fill", "none")
      .attr("stroke", C.steel).attr("stroke-width", 2.5).attr("opacity", 0.3)
      .attr("d", lineGen(paths[6]));

    // Moving heads.
    const poorDot = g.append("circle").attr("r", 7).attr("fill", C.orange);
    const richDot = g.append("circle").attr("r", 7).attr("fill", C.steel);

    // Variance tracker on the right of the chart.
    const tracker = svg.append("g").attr("transform", `translate(${W - 100},${margin.top})`);
    tracker.append("text").attr("y", -10).attr("fill", C.muted)
      .attr("font-size", 11).attr("font-weight", 600).text("σ²(log y)");
    const barBg = tracker.append("rect")
      .attr("width", 28).attr("height", h)
      .attr("fill", C.grid).attr("rx", 4);
    const barFill = tracker.append("rect")
      .attr("width", 28).attr("x", 0).attr("rx", 4)
      .attr("fill", C.teal).attr("opacity", 0.7);
    const varLabel = tracker.append("text").attr("x", 36).attr("y", 12)
      .attr("fill", C.text).attr("font-size", 12).attr("font-variant-numeric", "tabular-nums");
    const lagLabel = tracker.append("text").attr("x", 36).attr("y", 30)
      .attr("fill", C.muted).attr("font-size", 11);

    function variance(arr) {
      const m = arr.reduce((a,b) => a+b, 0) / arr.length;
      let s = 0;
      for (const v of arr) s += (v - m) * (v - m);
      return s / (arr.length - 1);
    }

    // Legend.
    const lg = svg.append("g").attr("transform", `translate(${margin.left + 12}, ${margin.top + 8})`);
    lg.append("rect").attr("width", 200).attr("height", 50).attr("fill", "rgba(15,23,41,0.55)").attr("stroke", C.line).attr("rx", 6);
    lg.append("circle").attr("cx", 14).attr("cy", 15).attr("r", 5).attr("fill", C.orange);
    lg.append("text").attr("x", 26).attr("y", 19).attr("fill", C.text).attr("font-size", 12).text("Poor country — fast catch-up");
    lg.append("circle").attr("cx", 14).attr("cy", 35).attr("r", 5).attr("fill", C.steel);
    lg.append("text").attr("x", 26).attr("y", 39).attr("fill", C.text).attr("font-size", 12).text("Rich country — slow growth");

    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const elapsed = (ts - t0) / 1000;
      const cycleSeconds = 9;
      const phase = (elapsed % cycleSeconds) / cycleSeconds;   // [0, 1)
      const tIdx = Math.floor(phase * 60);
      const tFrac = (phase * 60) - tIdx;
      const interp = (arr) => {
        const a = arr[tIdx];
        const b = arr[Math.min(60, tIdx + 1)];
        return a * (1 - tFrac) + b * tFrac;
      };
      poorDot.attr("cx", xScale(tIdx + tFrac)).attr("cy", yScale(interp(paths[0])));
      richDot.attr("cx", xScale(tIdx + tFrac)).attr("cy", yScale(interp(paths[6])));
      // Reveal trails up to current time.
      poorLine.attr("opacity", Math.min(1, 0.3 + phase));
      richLine.attr("opacity", Math.min(1, 0.3 + phase));

      // Variance across all 7 countries at this time.
      const currentVals = paths.map(p => interp(p));
      const v = variance(currentVals);
      const vMax = 2.0;
      const fillH = Math.min(h, (v / vMax) * h);
      barFill.attr("y", h - fillH).attr("height", fillH);
      varLabel.text(`σ² = ${v.toFixed(3)}`);
      // The qualitative lag message: variance peaks late in the cycle.
      const stage = tIdx < 12 ? "rising" : tIdx < 40 ? "near peak" : "falling";
      lagLabel.text(stage);

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  // ------------------------------------------------------------------
  // TAB 2 — Solow simulator.
  // ------------------------------------------------------------------
  (function initSolow() {
    const container = document.getElementById("solow-scatter");
    if (!container) return;

    const state = { N: 84, T: 19, beta: 0.0040, sigma: 0.015, seed: 7 };
    const chart = solowScatter(container);

    function refit() {
      const rng = DGP.mulberry32(state.seed);
      const normal = DGP.makeNormal(rng);
      // initial log incomes: roughly the 1960 cross-section spread.
      // mean 8.0, sd 1.0 (variance ≈ 1.0)
      const N = state.N, T = state.T;
      const y0 = new Float64Array(N);
      for (let i = 0; i < N; i++) y0[i] = 8.0 + normal() * 1.0;
      // generate growth using the Barro–Sala-i-Martin equation
      const alpha = 0.05;
      const trueLambda = -(1 - Math.exp(-state.beta * T)) / T;
      const growth = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        const eps = normal() * state.sigma;
        growth[i] = alpha + trueLambda * y0[i] + eps;
      }
      // OLS regression of growth on y0
      let sx=0, sy=0, sxx=0, sxy=0;
      for (let i = 0; i < N; i++) {
        sx += y0[i]; sy += growth[i];
        sxx += y0[i]*y0[i]; sxy += y0[i]*growth[i];
      }
      const xbar = sx / N, ybar = sy / N;
      const lambdaHat = (sxy - N*xbar*ybar) / (sxx - N*xbar*xbar);
      const alphaHat  = ybar - lambdaHat * xbar;
      // Convert to β̂
      let betaHat = NaN, halflife = NaN;
      const inside = 1 + lambdaHat * T;
      if (inside > 0) {
        betaHat = -Math.log(inside) / T;
        if (betaHat > 0) halflife = Math.log(2) / betaHat;
      }
      chart.update({ y0, growth, alphaHat, lambdaHat, T });
      document.getElementById("solow-stat-lambda").textContent =
        Number.isFinite(lambdaHat) ? lambdaHat.toFixed(5) : "—";
      document.getElementById("solow-stat-beta").textContent =
        Number.isFinite(betaHat) ? betaHat.toFixed(5) : "—";
      document.getElementById("solow-stat-btrue").textContent = state.beta.toFixed(4);
      document.getElementById("solow-stat-halflife").textContent =
        (Number.isFinite(halflife) && halflife > 0 && halflife < 5000)
          ? halflife.toFixed(0) + " yr"
          : (Number.isFinite(betaHat) && betaHat <= 0 ? "n/a (divergence)" : "—");
    }

    const onParam = debounce(refit, 60);
    function bindSlider(id, key, format) {
      const el = document.getElementById(id);
      el.addEventListener("input", e => {
        state[key] = +e.target.value;
        document.getElementById(id + "-val").textContent = format(state[key]);
        onParam();
      });
    }
    bindSlider("solow-n", "N", v => String(v));
    bindSlider("solow-T", "T", v => String(v));
    bindSlider("solow-b", "beta", v => v.toFixed(4));
    bindSlider("solow-s", "sigma", v => v.toFixed(3));

    document.getElementById("solow-reseed").addEventListener("click", () => {
      state.seed = Math.floor(Math.random() * 1e9) + 1;
      refit();
    });
    document.getElementById("solow-reset").addEventListener("click", () => {
      Object.assign(state, { N: 84, T: 19, beta: 0.0040, sigma: 0.015, seed: 7 });
      document.getElementById("solow-n").value = 84;
      document.getElementById("solow-T").value = 19;
      document.getElementById("solow-b").value = 0.0040;
      document.getElementById("solow-s").value = 0.015;
      document.getElementById("solow-n-val").textContent = "84";
      document.getElementById("solow-T-val").textContent = "19";
      document.getElementById("solow-b-val").textContent = "0.0040";
      document.getElementById("solow-s-val").textContent = "0.015";
      refit();
    });

    refit();
  })();

  function solowScatter(container) {
    const W = 760, H = 360;
    const margin = { top: 24, right: 24, bottom: 48, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("log initial income  ln(y₀)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-44})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("annualised growth  g");

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const zeroLine = g.append("line").attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
    const fittedLine = g.append("line").attr("stroke", C.orange).attr("stroke-width", 2.4);
    const pointsG = g.append("g").attr("class", "pts");

    function update({ y0, growth, alphaHat, lambdaHat }) {
      const xExt = d3.extent(y0);
      const yExt = d3.extent(growth);
      const xPad = (xExt[1] - xExt[0]) * 0.05 || 0.2;
      const yPad = (yExt[1] - yExt[0]) * 0.10 || 0.005;
      const xScale = d3.scaleLinear().domain([xExt[0]-xPad, xExt[1]+xPad]).range([0, w]);
      const yScale = d3.scaleLinear().domain([yExt[0]-yPad, yExt[1]+yPad]).range([h, 0]);

      xAxisG.call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format(".1f")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".3f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      // Zero growth line if in range.
      if (yScale.domain()[0] <= 0 && yScale.domain()[1] >= 0) {
        zeroLine.attr("x1", 0).attr("x2", w)
          .attr("y1", yScale(0)).attr("y2", yScale(0))
          .style("display", null);
      } else { zeroLine.style("display", "none"); }

      // OLS fit line.
      const x1 = xScale.domain()[0], x2 = xScale.domain()[1];
      const yp = x => alphaHat + lambdaHat * x;
      fittedLine
        .attr("x1", xScale(x1)).attr("x2", xScale(x2))
        .attr("y1", yScale(yp(x1))).attr("y2", yScale(yp(x2)));

      const pts = pointsG.selectAll("circle").data(Array.from(y0).map((x,i) => [x, growth[i]]));
      pts.exit().remove();
      pts.enter().append("circle").attr("r", 4).attr("fill", C.steel).attr("opacity", 0.75)
        .merge(pts)
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]));
    }
    return { update };
  }

  // ------------------------------------------------------------------
  // TAB 3 — Rolling β line chart from real data.
  // ------------------------------------------------------------------
  let DATA = null;

  function rbChart(container) {
    const W = 820, H = 380;
    const margin = { top: 28, right: 28, bottom: 48, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Start year of rolling window (end year fixed at 2019)");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-50})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("structural β");

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const zeroLine = g.append("line").attr("stroke", C.faint).attr("stroke-dasharray", "3 4");
    const benchLine = g.append("line").attr("stroke", C.teal)
      .attr("stroke-dasharray", "6 4").attr("stroke-width", 1.4).attr("opacity", 0.7);
    const benchLabel = g.append("text").attr("fill", C.teal).attr("font-size", 11);
    const ciBand = g.append("path").attr("fill", C.orange).attr("opacity", 0.15);
    const linePath = g.append("path").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2.2);
    const ptsG = g.append("g");
    const cursor = g.append("line").attr("stroke", C.teal).attr("stroke-width", 1.4)
      .attr("stroke-dasharray", "4 4");
    const cursorDot = g.append("circle").attr("r", 7).attr("fill", C.teal).attr("stroke", "#fff").attr("stroke-width", 1);
    let xScale, yScale, rows;

    function update(rowsIn, opts) {
      rows = rowsIn;
      const xExt = d3.extent(rows, d => d.startyear);
      const yMin = Math.min(0, d3.min(rows, d => d.lower));
      const yMax = Math.max(0, d3.max(rows, d => d.upper));
      const yPad = (yMax - yMin) * 0.05;
      xScale = d3.scaleLinear().domain(xExt).range([0, w]);
      yScale = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([h, 0]);

      xAxisG.call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".4f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      zeroLine.attr("x1", 0).attr("x2", w)
        .attr("y1", yScale(0)).attr("y2", yScale(0));

      // 2% benchmark.
      if (opts.showBench && yScale.domain()[1] >= 0.02) {
        benchLine.attr("x1", 0).attr("x2", w)
          .attr("y1", yScale(0.02)).attr("y2", yScale(0.02))
          .style("display", null);
        benchLabel
          .attr("x", w - 132).attr("y", yScale(0.02) - 5)
          .text("Conditional benchmark β = 0.02")
          .style("display", null);
      } else {
        benchLine.style("display", "none");
        benchLabel.style("display", "none");
      }

      // CI band.
      if (opts.showCI) {
        const area = d3.area()
          .x(d => xScale(d.startyear))
          .y0(d => yScale(d.lower))
          .y1(d => yScale(d.upper))
          .curve(d3.curveMonotoneX);
        ciBand.attr("d", area(rows)).style("display", null);
      } else {
        ciBand.style("display", "none");
      }

      const lineGen = d3.line()
        .x(d => xScale(d.startyear))
        .y(d => yScale(d.beta))
        .curve(d3.curveMonotoneX);
      linePath.attr("d", lineGen(rows));

      const pts = ptsG.selectAll("circle").data(rows, d => d.startyear);
      pts.exit().remove();
      pts.enter().append("circle").attr("r", 3)
        .attr("fill", d => d.beta >= 0 ? C.teal : C.orange).attr("opacity", 0.7)
        .merge(pts)
        .attr("cx", d => xScale(d.startyear))
        .attr("cy", d => yScale(d.beta))
        .attr("fill", d => d.beta >= 0 ? C.teal : C.orange);
    }

    function highlight(year) {
      if (!rows) return;
      const row = rows.find(r => r.startyear === year);
      if (!row) return;
      cursor.attr("x1", xScale(year)).attr("x2", xScale(year))
        .attr("y1", 0).attr("y2", h);
      cursorDot.attr("cx", xScale(year)).attr("cy", yScale(row.beta));
    }

    return { update, highlight };
  }

  function initRollingBeta() {
    if (!DATA) return;
    const container = document.getElementById("rb-chart");
    if (!container) return;
    const chart = rbChart(container);
    const state = { year: 2000, showBench: true, showCI: true };
    const rows = DATA.rolling_ols || [];

    function render() {
      chart.update(rows, { showBench: state.showBench, showCI: state.showCI });
      chart.highlight(state.year);
      const row = rows.find(r => r.startyear === state.year);
      if (row) {
        document.getElementById("rb-stat-beta").textContent = row.beta.toFixed(5);
        document.getElementById("rb-stat-speed").textContent = (row.beta * 100).toFixed(3) + "%";
        if (row.beta > 0 && row.halflife != null && row.halflife < 5000) {
          document.getElementById("rb-stat-half").textContent = row.halflife.toFixed(0) + " yr";
        } else if (row.beta <= 0) {
          document.getElementById("rb-stat-half").textContent = "n/a (divergence)";
        } else {
          document.getElementById("rb-stat-half").textContent = "> 5,000 yr";
        }
        document.getElementById("rb-stat-ci").textContent =
          `[${row.lower.toFixed(4)}, ${row.upper.toFixed(4)}]`;
      }
    }

    document.getElementById("rb-y").addEventListener("input", e => {
      state.year = +e.target.value;
      document.getElementById("rb-y-val").textContent = state.year;
      render();
    });
    document.getElementById("rb-bench").addEventListener("change", e => {
      state.showBench = e.target.checked;
      document.getElementById("rb-bench-val").textContent = state.showBench ? "on" : "off";
      render();
    });
    document.getElementById("rb-ci").addEventListener("change", e => {
      state.showCI = e.target.checked;
      document.getElementById("rb-ci-val").textContent = state.showCI ? "on" : "off";
      render();
    });

    render();
  }

  // ------------------------------------------------------------------
  // TAB 4 — Sigma evolution line chart from real data.
  // ------------------------------------------------------------------
  function sgChart(container) {
    const W = 820, H = 380;
    const margin = { top: 28, right: 28, bottom: 48, left: 64 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;
    const svg = ensureSVG(container, W, H);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("transform", `translate(${w/2},${h+36})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("Year");
    g.append("text")
      .attr("transform", `rotate(-90) translate(${-h/2},${-50})`)
      .attr("text-anchor", "middle").attr("fill", C.text).attr("font-size", 12)
      .text("variance of log GDP per capita");

    const xAxisG = g.append("g").attr("transform", `translate(0,${h})`);
    const yAxisG = g.append("g");
    const ciBand = g.append("path").attr("fill", C.steel).attr("opacity", 0.18);
    const linePath = g.append("path").attr("fill", "none").attr("stroke", C.steel).attr("stroke-width", 2.4);
    const mark2000 = g.append("line").attr("stroke", C.teal).attr("stroke-width", 1.6)
      .attr("stroke-dasharray", "6 4");
    const mark2000lbl = g.append("text").attr("fill", C.teal).attr("font-size", 11);
    const mark2008 = g.append("line").attr("stroke", C.orange).attr("stroke-width", 1.6)
      .attr("stroke-dasharray", "6 4");
    const mark2008lbl = g.append("text").attr("fill", C.orange).attr("font-size", 11);
    const cursor = g.append("line").attr("stroke", C.teal).attr("stroke-width", 1.4)
      .attr("stroke-dasharray", "4 4");
    const cursorDot = g.append("circle").attr("r", 7).attr("fill", C.teal).attr("stroke", "#fff").attr("stroke-width", 1);
    let xScale, yScale, rows;

    function update(rowsIn, opts) {
      rows = rowsIn;
      const xExt = d3.extent(rows, d => d.year);
      const yMin = Math.min(d3.min(rows, d => d.var_lb), 0.5);
      const yMax = d3.max(rows, d => d.var_ub) * 1.02;
      xScale = d3.scaleLinear().domain(xExt).range([0, w]);
      yScale = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

      xAxisG.call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("d")))
        .selectAll("text").attr("fill", C.muted);
      yAxisG.call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2f")))
        .selectAll("text").attr("fill", C.muted);
      g.selectAll(".domain, .tick line").attr("stroke", C.muted);

      if (opts.showCI) {
        const area = d3.area()
          .x(d => xScale(d.year))
          .y0(d => yScale(d.var_lb))
          .y1(d => yScale(d.var_ub))
          .curve(d3.curveMonotoneX);
        ciBand.attr("d", area(rows)).style("display", null);
      } else { ciBand.style("display", "none"); }

      const lineGen = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.variance))
        .curve(d3.curveMonotoneX);
      linePath.attr("d", lineGen(rows));

      // Markers.
      if (opts.show2000) {
        mark2000.attr("x1", xScale(2000)).attr("x2", xScale(2000))
          .attr("y1", 0).attr("y2", h).style("display", null);
        mark2000lbl.attr("x", xScale(2000) + 4).attr("y", 12).text("2000: β-flip").style("display", null);
      } else {
        mark2000.style("display", "none");
        mark2000lbl.style("display", "none");
      }
      if (opts.show2008) {
        mark2008.attr("x1", xScale(2008)).attr("x2", xScale(2008))
          .attr("y1", 0).attr("y2", h).style("display", null);
        mark2008lbl.attr("x", xScale(2008) + 4).attr("y", 26).text("2008: σ peak").style("display", null);
      } else {
        mark2008.style("display", "none");
        mark2008lbl.style("display", "none");
      }
    }

    function highlight(year) {
      if (!rows) return;
      const row = rows.find(r => r.year === year);
      if (!row) return;
      cursor.attr("x1", xScale(year)).attr("x2", xScale(year))
        .attr("y1", 0).attr("y2", h);
      cursorDot.attr("cx", xScale(year)).attr("cy", yScale(row.variance));
    }

    return { update, highlight };
  }

  function initSigma() {
    if (!DATA) return;
    const container = document.getElementById("sg-chart");
    if (!container) return;
    const chart = sgChart(container);
    const state = { year: 2008, show2000: true, show2008: true, showCI: true };
    const rows = DATA.sigma || [];
    const v1960 = (rows.find(r => r.year === 1960) || {}).variance || 0.924;

    function render() {
      chart.update(rows, {
        show2000: state.show2000,
        show2008: state.show2008,
        showCI: state.showCI,
      });
      chart.highlight(state.year);
      const row = rows.find(r => r.year === state.year);
      if (row) {
        document.getElementById("sg-stat-var").textContent = row.variance.toFixed(3);
        document.getElementById("sg-stat-sd").textContent = Math.sqrt(row.variance).toFixed(3);
        const pct = ((row.variance / v1960) - 1) * 100;
        document.getElementById("sg-stat-pct").textContent =
          (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
        document.getElementById("sg-stat-ci").textContent =
          `[${row.var_lb.toFixed(3)}, ${row.var_ub.toFixed(3)}]`;
      }
    }

    document.getElementById("sg-y").addEventListener("input", e => {
      state.year = +e.target.value;
      document.getElementById("sg-y-val").textContent = state.year;
      render();
    });
    document.getElementById("sg-m1").addEventListener("change", e => {
      state.show2000 = e.target.checked;
      document.getElementById("sg-m1-val").textContent = state.show2000 ? "on" : "off";
      render();
    });
    document.getElementById("sg-m2").addEventListener("change", e => {
      state.show2008 = e.target.checked;
      document.getElementById("sg-m2-val").textContent = state.show2008 ? "on" : "off";
      render();
    });
    document.getElementById("sg-ci").addEventListener("change", e => {
      state.showCI = e.target.checked;
      document.getElementById("sg-ci-val").textContent = state.showCI ? "on" : "off";
      render();
    });

    render();
  }

  // ------------------------------------------------------------------
  // Data loader.
  // ------------------------------------------------------------------
  fetch("data/results.json").then(r => r.json()).then(data => {
    DATA = data;
    initRollingBeta();
    initSigma();
  }).catch(err => {
    console.error("Failed to load results.json:", err);
    const rb = document.getElementById("rb-chart");
    const sg = document.getElementById("sg-chart");
    if (rb) rb.innerHTML =
      '<div style="padding:20px;color:#d97757;">Failed to load results.json — rolling β data unavailable.</div>';
    if (sg) sg.innerHTML =
      '<div style="padding:20px;color:#d97757;">Failed to load results.json — sigma evolution data unavailable.</div>';
  });

  // ------------------------------------------------------------------
  // Global error handler.
  // ------------------------------------------------------------------
  window.addEventListener("error", function (e) {
    console.error("[write-app] uncaught error:", e.error);
  });
})();
