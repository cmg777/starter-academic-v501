// app.js — tab routing + widget glue for the Aceh tsunami interactive lab.
(function () {
  "use strict";

  const tabs = ["overview", "forest", "simulator", "inference"];
  let anim = null;

  function activateTab(id) {
    tabs.forEach((t) => {
      document.getElementById("pane-" + t).classList.toggle("active", t === id);
      document.querySelector(`.tab-strip button[data-tab="${t}"]`).classList.toggle("active", t === id);
    });
    if (anim) (id === "overview" ? anim.play() : anim.stop());
  }
  document.querySelectorAll(".tab-strip button").forEach((b) =>
    b.addEventListener("click", () => activateTab(b.dataset.tab))
  );

  const fmt = (v, d = 4) => (v >= 0 ? "+" : "") + v.toFixed(d);
  const stars = (t) => (Math.abs(t) > 2.576 ? "***" : Math.abs(t) > 1.96 ? "**" : Math.abs(t) > 1.645 ? "*" : "ns");

  fetch("data/results.json")
    .then((r) => r.json())
    .then((DATA) => init(DATA))
    .catch((e) => {
      const card = document.createElement("div");
      card.className = "card";
      const p = document.createElement("p");
      p.className = "note";
      p.textContent = `Could not load data/results.json (${e}). The app needs to be served over HTTP, not opened as a file.`;
      card.appendChild(p);
      document.getElementById("pane-overview").appendChild(card);
    });

  function init(DATA) {
    // ── Tab 1: parallel-trends animation ──
    anim = CHARTS.parallel_trends(document.getElementById("anim"), DATA.trajectories);

    // ── Tab 2: forest plot ──
    const groups = [...new Set(DATA.estimates.map((e) => e.group))];
    const active = new Set(groups);
    const fp = CHARTS.forest_plot(document.getElementById("forest-chart"));
    const togWrap = document.getElementById("forest-toggles");
    groups.forEach((g) => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.addEventListener("change", () => {
        cb.checked ? active.add(g) : active.delete(g);
        fp.update(DATA.estimates, active);
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + g));
      togWrap.appendChild(label);
    });
    fp.update(DATA.estimates, active);

    // ── Tab 3: tsunami DGP simulator ──
    const sc = CHARTS.sim_compare(document.getElementById("sim-chart"));
    const hist = CHARTS.histogram(document.getElementById("sim-hist"));
    const ctl = {
      nTreated: document.getElementById("s-ntreated"),
      shock: document.getElementById("s-shock"),
      recovery: document.getElementById("s-recovery"),
      noise: document.getElementById("s-noise"),
    };
    let seedCounter = 1;
    function readOpts(seed) {
      return {
        nTreated: +ctl.nTreated.value,
        nControl: DATA.truth.n_control,
        shock: +ctl.shock.value,
        recovery: +ctl.recovery.value,
        noise: +ctl.noise.value,
        seed: seed,
      };
    }
    function refreshLabels() {
      document.getElementById("v-ntreated").textContent = ctl.nTreated.value;
      document.getElementById("v-shock").textContent = (+ctl.shock.value).toFixed(3);
      document.getElementById("v-recovery").textContent = "+" + (+ctl.recovery.value).toFixed(3);
      document.getElementById("v-noise").textContent = (+ctl.noise.value).toFixed(2);
    }
    function runOne() {
      refreshLabels();
      const opts = readOpts(++seedCounter);
      const est = DGP.simulate_did(opts);
      sc.update(est, { shock: opts.shock, recovery: opts.recovery });
      document.getElementById("st-rec-est").textContent = fmt(est.recovery);
      document.getElementById("st-rec-true").textContent = fmt(opts.recovery);
      document.getElementById("st-shock-est").textContent = fmt(est.tsunami);
    }
    function runMany() {
      refreshLabels();
      const vals = [];
      for (let i = 0; i < 200; i++) vals.push(DGP.simulate_did(readOpts(1000 + i)).recovery);
      const sd = Math.sqrt(d3.mean(vals.map((v) => (v - d3.mean(vals)) ** 2)));
      hist.update(vals, +ctl.recovery.value);
      document.getElementById("st-sd").textContent = sd.toFixed(4);
      document.getElementById("sim-hist-wrap").style.display = "block";
      document.getElementById("st-sd-msg").textContent =
        +ctl.nTreated.value <= 12
          ? "few treated units → wide spread → fragile estimate (the real study had only 10)."
          : "more treated units → tighter spread → a more reliable estimate.";
    }
    Object.values(ctl).forEach((s) => s.addEventListener("input", runOne));
    document.getElementById("run-sims").addEventListener("click", runMany);
    runOne();

    // ── Tab 4: naive-vs-Conley SE explorer ──
    const recRow = DATA.se_comparison.find((r) => r.coef.startsWith("Recovery"));
    const se = CHARTS.se_explorer(document.getElementById("inf-chart"));
    const rho = document.getElementById("s-rho");
    function refreshInf() {
      const r = +rho.value; // 0 = independent, 1 = fully spatially correlated
      const effSE = recRow.naive + r * (recRow.hac - recRow.naive);
      const t = recRow.estimate / effSE;
      document.getElementById("v-rho").textContent = r.toFixed(2);
      se.update(recRow.estimate, effSE, recRow);
      document.getElementById("st-eff-se").textContent = effSE.toFixed(4);
      document.getElementById("st-tstat").textContent = t.toFixed(2);
      const st = stars(t);
      const stEl = document.getElementById("st-sig");
      stEl.textContent = st;
      stEl.className = "stat-value " + (st === "ns" ? "orange" : "teal");
      document.getElementById("st-sig-msg").textContent =
        st === "***" ? "naive SE → looks significant at 1% (overconfident)"
          : st === "**" ? "honest: significant at 5% (the paper's verdict)"
            : st === "*" ? "only marginally significant"
              : "no longer distinguishable from zero";
    }
    rho.addEventListener("input", refreshInf);
    rho.value = "0.95"; // start near the paper's Conley-HAC regime
    refreshInf();

    activateTab("overview");
  }
})();
