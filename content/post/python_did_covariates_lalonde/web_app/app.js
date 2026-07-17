/* app.js — tab switching + the Spec Explorer stepper. */

(function () {
  const DATA = window.ESTIMATES;

  // ---- Tabs ----
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => {
        t.classList.remove("active"); t.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
      document.getElementById(tab.dataset.pane).classList.add("active");
      // (re)render charts on first reveal so widths are correct
      if (tab.dataset.pane === "pane-explorer") drawForest();
      if (tab.dataset.pane === "pane-trends") renderTrends("#trends", DATA.group_trend_means);
    });
  });

  // ---- Explorer data: drop the duplicate "HIT by hand" row (== Saturated) ----
  const ESTS = DATA.estimators.filter(e => !/HIT by hand/i.test(e.label));

  // Per-spec pedagogy (matched by spec code).
  const NOTES = {
    "0":  "The raw 2×2 difference-in-differences, with no covariates at all. The number to beat.",
    "A":  "Covariates added additively (two-way fixed effects with controls). They are time-invariant, so the within transformation sweeps them out — the DiD coefficient never depended on them. Inert.",
    "BT": "Each covariate is interacted with treatment, letting the effect vary by worker. This relaxes constant treatment effects but leaves the control group's counterfactual trend untouched. Inert.",
    "B":  "Each covariate is interacted with post, so different workers can be on different earnings trajectories. This bends the control's counterfactual trend — the reason the naive estimate was wrong. Corrected.",
    "C":  "First-difference the outcome, then saturate on treatment × covariates. Because the outcome is a change, each covariate's coefficient is its effect on the trend — correcting the trend and relaxing constant effects at once. Equals Heckman-Ichimura-Todd (1997).",
  };
  const PROP_NOTES = {
    "IPW": "Model the probability of being a trainee and reweight the controls to resemble the treated (Abadie 2005). A propensity-based route to the same answer.",
    "DR":  "Combine the outcome regression with propensity reweighting (Sant'Anna-Zhao 2020): consistent if either model is right — two shots at the truth.",
  };
  function noteFor(e) {
    if (NOTES[e.spec]) return NOTES[e.spec];
    if (/IPW/i.test(e.label)) return PROP_NOTES.IPW;
    if (/DR|Doubly/i.test(e.label)) return PROP_NOTES.DR;
    return "";
  }
  const BADGE = { inert: "inert · covariate in the level / effect",
                  corrected: "corrected · covariate in the trend",
                  propensity: "propensity-based estimator" };

  let idx = 0, timer = null;

  const readout = document.getElementById("att-readout");
  const badge = document.getElementById("att-badge");
  const specName = document.getElementById("spec-name");
  const specNote = document.getElementById("spec-note");
  const dotsWrap = document.getElementById("step-dots");

  // build dots
  ESTS.forEach((e, i) => {
    const d = document.createElement("div");
    d.className = "dot " + e.group;
    d.title = e.label;
    d.addEventListener("click", () => { stop(); goto(i); });
    dotsWrap.appendChild(d);
  });

  function animateNumber(to) {
    const from = parseFloat(readout.dataset.val || "3621");
    const t0 = performance.now(), dur = 520;
    function frame(t) {
      const k = Math.min(1, (t - t0) / dur);
      const val = from + (to - from) * (1 - Math.pow(1 - k, 3));
      readout.textContent = "$" + d3.format(",")(Math.round(val));
      if (k < 1) requestAnimationFrame(frame);
      else readout.dataset.val = to;
    }
    requestAnimationFrame(frame);
  }

  function drawForest() {
    renderForest("#forest", ESTS, DATA.benchmark, idx);
  }

  function goto(i) {
    idx = (i + ESTS.length) % ESTS.length;
    const e = ESTS[idx];
    animateNumber(e.att);
    const col = e.group === "propensity" ? "var(--teal)"
      : e.group === "corrected" ? "var(--steel)" : "var(--grey)";
    readout.style.color = col;
    badge.className = "readout-badge " + e.group;
    badge.textContent = BADGE[e.group];
    specName.textContent = e.spec !== "-" ? `Spec ${e.spec} — ${e.label}` : e.label;
    specNote.textContent = noteFor(e);
    dotsWrap.querySelectorAll(".dot").forEach((d, j) => d.classList.toggle("active", j === idx));
    drawForest();
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null;
      document.getElementById("btn-play").textContent = "▶ Play the ladder"; }
  }
  function play() {
    if (timer) { stop(); return; }
    document.getElementById("btn-play").textContent = "⏸ Pause";
    goto(0);
    timer = setInterval(() => {
      if (idx >= ESTS.length - 1) { stop(); return; }
      goto(idx + 1);
    }, 1400);
  }

  document.getElementById("btn-prev").addEventListener("click", () => { stop(); goto(idx - 1); });
  document.getElementById("btn-next").addEventListener("click", () => { stop(); goto(idx + 1); });
  document.getElementById("btn-play").addEventListener("click", play);
  window.addEventListener("resize", () => {
    if (document.getElementById("pane-explorer").classList.contains("active")) drawForest();
    if (document.getElementById("pane-trends").classList.contains("active"))
      renderTrends("#trends", DATA.group_trend_means);
  });

  // initial state
  readout.dataset.val = "3621";
  goto(0);
})();
