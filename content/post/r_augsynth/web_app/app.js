/* app.js — controller for the Kansas ASCM lab.
   Loads results.json, wires the tab strip, populates stats, draws all charts,
   and runs the significance simulator. Pure client-side, no backend. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fmtPct = (logpts) => {
    const p = (Math.exp(logpts) - 1) * 100;
    return (p >= 0 ? "+" : "−") + Math.abs(p).toFixed(1) + "%";
  };
  const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  /* ---------- tab switching ---------- */
  function activate(paneId) {
    document.querySelectorAll(".tab").forEach(b => {
      const on = b.dataset.pane === paneId;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".tab-pane").forEach(p =>
      p.classList.toggle("active", p.id === paneId));
    if (location.hash !== "#" + paneId) history.replaceState(null, "", "#" + paneId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".tab").forEach(b =>
    b.addEventListener("click", () => activate(b.dataset.pane)));
  document.querySelectorAll(".cta-card").forEach(c =>
    c.addEventListener("click", () => activate(c.dataset.goto)));
  // deep-link: honour a #pane-xxx hash on load
  const initial = location.hash.replace("#", "");
  if (initial && document.getElementById(initial) &&
      document.getElementById(initial).classList.contains("tab-pane")) activate(initial);

  /* ---------- load data and render ---------- */
  fetch("data/results.json")
    .then(r => r.json())
    .then(render)
    .catch(err => {
      console.error(err);
      document.querySelector("main").insertAdjacentHTML("afterbegin",
        '<div class="card" style="border-color:#d97757">Could not load <code>data/results.json</code>. ' +
        'Serve this folder over HTTP (e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</div>');
    });

  function render(R) {
    /* ----- Tab 1: hero ----- */
    setText("hero-att", fmtPct(R.ridge.att));
    setText("hero-bias", "+" + R.ridge.bias.toFixed(3));
    // placebo rank
    const ratios = R.placebo.ratio.filter(isFinite);
    const ksIdx = R.placebo.trt.findIndex(t => t === "Treatment");
    const ksRatio = R.placebo.ratio[ksIdx];
    const rank = ratios.filter(v => v >= ksRatio).length;
    setText("hero-rank", rank + "th of " + ratios.length);

    Charts.levels("#intro-chart", R.levels);

    /* ----- Tab 2: build ----- */
    setText("b-att", R.scm.att.toFixed(3));
    setText("b-l2", R.scm.l2.toFixed(3));
    setText("b-pct", R.scm.pct.toFixed(1) + "%");
    setText("b-ndonor", R.meta.n_donors_scm);
    Charts.weights("#weights-chart", R.weights);
    Charts.gap("#scm-gap-chart", R.scm_gap);

    /* ----- Tab 3: augmentation ----- */
    setText("a-scm", R.scm.att.toFixed(3));
    setText("a-ridge", R.ridge.att.toFixed(3));
    setText("a-bias", "+" + R.ridge.bias.toFixed(3));
    setText("a-lambda", R.ridge.lambda.toFixed(3));
    Charts.overlay("#overlay-chart", R.scm_gap, R.ridge_gap);
    Charts.cv("#cv-chart", R.cv);
    Charts.modelForest("#modelcomp-chart", R.model_comparison);

    /* ----- Tab 4: inference ----- */
    Charts.infForest("#forest-chart", R.inference);
    buildScoreboard(R.inference);
    Charts.placebo("#placebo-chart", R.placebo);
    setText("placebo-note",
      `Kansas's RMSPE ratio is ${ksRatio.toFixed(2)}, ranking ${rank} of ${ratios.length} — a permutation p-value of ${R.inference.perm_p.toFixed(2)}.`);
    initSimulator();
  }

  /* ---------- inference scoreboard ---------- */
  function buildScoreboard(inf) {
    const host = $("infer-scoreboard");
    if (!host) return;
    const rows = inf.method.map((m, i) => {
      const lo = inf.lower[i], hi = inf.upper[i], p = inf.p_val[i];
      let detail, sig;
      if (lo != null && hi != null) {
        sig = Math.sign(lo) === Math.sign(hi);
        detail = `95% CI [${lo.toFixed(3)}, ${hi.toFixed(3)}]`;
      } else {
        sig = p != null && p < 0.05;
        detail = `p = ${p.toFixed(3)}`;
      }
      return { m, est: inf.estimate[i], detail, sig };
    });
    host.innerHTML = rows.map(r => `
      <div class="score-row">
        <span class="fn">${r.m}</span>
        <span class="est">${r.est.toFixed(3)}</span>
        <span class="ci">${r.detail}</span>
        <span class="sig-badge ${r.sig ? "yes" : "no"}">${r.sig ? "excludes 0" : "borderline"}</span>
      </div>`).join("");
  }

  /* ---------- significance simulator ---------- */
  function initSimulator() {
    const eff = $("sim-eff"), noise = $("sim-noise"), pre = $("sim-pre");
    if (!eff) return;
    function update() {
      const p = {
        eff: +eff.value / 100,      // slider is in log-pts x100
        noise: +noise.value / 100,
        pre: +pre.value
      };
      setText("sim-eff-v", (+eff.value).toFixed(1));
      setText("sim-noise-v", (+noise.value).toFixed(1));
      setText("sim-pre-v", pre.value);
      const out = Charts.sim("#sim-chart", p);
      setText("sim-est", fmtPct(out.est));
      setText("sim-ci", `[${fmtPct(out.lo)}, ${fmtPct(out.hi)}]`);
      setText("sim-p", out.pval < 0.001 ? "<0.001" : out.pval.toFixed(3));
      const badge = $("sim-badge");
      badge.textContent = out.sig ? "significant" : "not significant";
      badge.className = "sig-badge " + (out.sig ? "yes" : "no");
    }
    [eff, noise, pre].forEach(s => s.addEventListener("input", update));
    update();
  }
})();
