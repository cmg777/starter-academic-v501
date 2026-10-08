// app.js — wires the FWL Interactive Lab DOM to dgp.js and charts.js.
// Runs after window.d3, window.DGP and window.CHARTS are defined.
//
// Every number the page prints about the post comes from data/results.json
// (written by ../script.py) or is computed live from the post's 50 restaurants or
// from the simulator; nothing is typed in by hand.

(function () {
  "use strict";

  const $ = id => document.getElementById(id);

  // Number formatting with a true minus sign and an optional leading "+".
  function fmt(x, dp, plus) {
    if (x === null || x === undefined || !Number.isFinite(x)) return "—";
    const d = dp === undefined ? 3 : dp;
    const s = Math.abs(x).toFixed(d);
    if (+s === 0) return s;
    return (x < 0 ? "−" : (plus ? "+" : "")) + s;
  }
  function pct(x, dp) {
    return Number.isFinite(x) ? (x * 100).toFixed(dp || 0) + "%" : "—";
  }
  // Estimator hats drawn by CSS (styles.css .hat): a combining circumflex
  // renders off-center in the system sans stack. Used in quiz feedback, which
  // is therefore written with innerHTML (all text is authored here; the
  // numbers come from fmt()).
  const G_HAT = '<span class="hat lo">γ</span>';
  const D_HAT = '<span class="hat">δ</span>';
  function debounce(fn, ms) {
    let h = null;
    return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  // ------------------------------------------------------------------
  // Tabs + deep links (#intro | #lab | #forest | #mc | #quiz).
  // ------------------------------------------------------------------
  const HASH_TO_PANE = {
    intro: "pane-intro", lab: "pane-lab", forest: "pane-forest", mc: "pane-mc", quiz: "pane-quiz",
  };
  const tabs = Array.from(document.querySelectorAll(".tab-strip [role='tab']"));
  let activePane = "pane-intro";

  function paneFromHash(hash) {
    const key = String(hash || "").replace(/^#/, "").toLowerCase();
    return HASH_TO_PANE[key] || "pane-intro";
  }

  function activateTab(paneId, opts) {
    opts = opts || {};
    if (!document.getElementById(paneId)) paneId = "pane-intro";
    activePane = paneId;
    tabs.forEach(btn => {
      const on = btn.dataset.pane === paneId;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      if (on && opts.focus) btn.focus();
      if (on && opts.updateHash && window.history && history.replaceState) {
        history.replaceState(null, "", "#" + btn.dataset.hash);
      }
    });
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
    renderActive();
    if (opts.scroll) window.scrollTo({ top: 0, behavior: "auto" });
  }

  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.pane, { updateHash: true }));
    btn.addEventListener("keydown", ev => {
      let j = null;
      if (ev.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (ev.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = tabs.length - 1;
      if (j === null) return;
      ev.preventDefault();
      activateTab(tabs[j].dataset.pane, { updateHash: true, focus: true });
    });
  });
  window.addEventListener("hashchange", () => {
    activateTab(paneFromHash(location.hash), { scroll: true });
  });

  // ------------------------------------------------------------------
  // TAB 2 — Confounding Lab (runs without results.json).
  // ------------------------------------------------------------------
  const LAB_DEFAULTS = { n: 50, gamma: 0.30, pi: -0.50, beta: 0.20, seed: 42 };
  const lab = Object.assign({}, LAB_DEFAULTS, {
    bars: CHARTS.naive_vs_fwl_bars($("lab-bars")),
  });
  $("lab-sdI").textContent = DGP.CONST.income_sd;
  $("lab-sdC").textContent = DGP.CONST.coupons_noise_sd;
  $("lab-true").textContent = fmt(lab.beta, 2);

  function lab_refit() {
    const sim = DGP.simulate_fwl_sample({
      n: lab.n, gamma: lab.gamma, pi: lab.pi, beta: lab.beta, seed: lab.seed,
    });
    lab.sim = sim;
    const popDelta = DGP.population_delta(lab.pi);
    const popBias = DGP.population_bias(lab.gamma, lab.pi);
    const ovbHat = sim.full.gamma_hat * sim.delta_hat;
    const gap = sim.naive.b - sim.fwl.b;
    $("lab-naive-b").textContent = fmt(sim.naive.b, 3);
    $("lab-naive-se").textContent = fmt(sim.naive.se, 3);
    $("lab-naive-bias").textContent = fmt(sim.naive.b - lab.beta, 3, true);
    $("lab-fwl-b").textContent = fmt(sim.fwl.b, 3);
    $("lab-fwl-se").textContent = fmt(sim.fwl.se, 3);
    $("lab-fwl-bias").textContent = fmt(sim.fwl.b - lab.beta, 3, true);
    $("lab-pop-delta").textContent = fmt(popDelta, 3);
    $("lab-pop-bias").textContent = fmt(popBias, 3, true);
    $("lab-pop-plim").textContent = fmt(lab.beta + popBias, 3);
    $("lab-gamma-hat").textContent = fmt(sim.full.gamma_hat, 4);
    $("lab-delta-hat").textContent = fmt(sim.delta_hat, 4);
    $("lab-ovb-hat").textContent = fmt(ovbHat, 4);
    $("lab-gap").textContent = fmt(gap, 4);
    const diff = Math.abs(gap - ovbHat);
    $("lab-identity").textContent = diff < 1e-9
      ? `✓ Equal to machine precision (difference ${diff === 0 ? "0" : diff.toExponential(1)}): the identity is algebra, not an approximation.`
      : `Difference ${diff.toExponential(2)} — check the inputs.`;
    lab.bars.update({ naive: sim.naive.b, fwl: sim.fwl.b, beta_true: lab.beta });
  }

  function syncLabInputs() {
    $("lab-n").value = lab.n;
    $("lab-g").value = lab.gamma;
    $("lab-d").value = lab.pi;
    $("lab-n-val").textContent = lab.n;
    $("lab-g-val").textContent = fmt(lab.gamma, 2);
    $("lab-d-val").textContent = fmt(lab.pi, 2);
  }

  const onLabChange = debounce(lab_refit, 60);
  $("lab-n").addEventListener("input", e => {
    lab.n = +e.target.value; $("lab-n-val").textContent = lab.n; onLabChange();
  });
  $("lab-g").addEventListener("input", e => {
    lab.gamma = +e.target.value; $("lab-g-val").textContent = fmt(lab.gamma, 2); onLabChange();
  });
  $("lab-d").addEventListener("input", e => {
    lab.pi = +e.target.value; $("lab-d-val").textContent = fmt(lab.pi, 2); onLabChange();
  });
  $("lab-reseed").addEventListener("click", () => {
    lab.seed = Math.floor(Math.random() * 1e9) + 1;
    lab_refit();
  });
  $("lab-reset").addEventListener("click", () => {
    Object.assign(lab, LAB_DEFAULTS);
    syncLabInputs();
    lab_refit();
  });
  syncLabInputs();
  lab_refit();

  // ------------------------------------------------------------------
  // TAB 4 — Monte Carlo (runs without results.json).
  // ------------------------------------------------------------------
  const MC_DEFAULTS = { n: 100, gamma: 0.30, pi: -0.50, beta: 0.20 };
  const MC_SIMS = 100;
  const MC_SEED0 = 1000;
  const mc = Object.assign({}, MC_DEFAULTS, {
    hist: CHARTS.naive_vs_fwl_histograms($("mc-hist")),
    hasRun: false,
  });

  function mc_one(settings, i) {
    return DGP.simulate_fwl_sample({
      n: settings.n, gamma: settings.gamma, pi: settings.pi,
      beta: settings.beta, seed: MC_SEED0 + i,
    });
  }
  function flipRate(arr) {
    return arr.length ? arr.filter(v => v < 0).length / arr.length : NaN;
  }

  // The default-settings sign-flip rate quoted in the "what to look for"
  // panel is computed here, with the same seeds as the Run button.
  (function () {
    const naive = [];
    for (let i = 0; i < MC_SIMS; i++) naive.push(mc_one(MC_DEFAULTS, i).naive.b);
    $("mc-default-flip").textContent = pct(flipRate(naive), 0);
  })();

  $("mc-n").addEventListener("input", e => {
    mc.n = +e.target.value; $("mc-n-val").textContent = mc.n;
  });
  $("mc-g").addEventListener("input", e => {
    mc.gamma = +e.target.value; $("mc-g-val").textContent = fmt(mc.gamma, 2);
  });
  $("mc-d").addEventListener("input", e => {
    mc.pi = +e.target.value; $("mc-d-val").textContent = fmt(mc.pi, 2);
  });

  $("mc-run").addEventListener("click", function () {
    const btn = this;
    btn.disabled = true;
    const settings = { n: mc.n, gamma: mc.gamma, pi: mc.pi, beta: mc.beta };
    const progBar = document.querySelector("#mc-progress > div");
    const progLabel = $("mc-progress-label");
    const naiveArr = [];
    const fwlArr = [];
    let i = 0;
    function step() {
      const end = Math.min(MC_SIMS, i + 5);
      for (; i < end; i++) {
        const sim = mc_one(settings, i);
        if (Number.isFinite(sim.naive.b)) naiveArr.push(sim.naive.b);
        if (Number.isFinite(sim.fwl.b)) fwlArr.push(sim.fwl.b);
      }
      progBar.style.width = (i / MC_SIMS) * 100 + "%";
      progLabel.textContent = `simulation ${i} / ${MC_SIMS}`;
      if (i < MC_SIMS) { setTimeout(step, 0); return; }
      progLabel.textContent = `done (${MC_SIMS} simulations, n = ${settings.n}, γ = ${fmt(settings.gamma, 2)}, π = ${fmt(settings.pi, 2)})`;
      $("mc-hist").style.display = "block";
      $("mc-hist-stats").style.display = "grid";
      mc.hasRun = true;
      const plim = settings.beta + DGP.population_bias(settings.gamma, settings.pi);
      mc.hist.update({ naive: naiveArr, fwl: fwlArr, beta_true: settings.beta, plim });
      $("mc-naive-mean").textContent = fmt(d3.mean(naiveArr), 3);
      $("mc-plim").textContent = fmt(plim, 3);
      $("mc-naive-sd").textContent = fmt(d3.deviation(naiveArr), 3);
      $("mc-fwl-mean").textContent = fmt(d3.mean(fwlArr), 3);
      $("mc-fwl-sd").textContent = fmt(d3.deviation(fwlArr), 3);
      $("mc-naive-flip").textContent = pct(flipRate(naiveArr), 0);
      btn.disabled = false;
    }
    step();
  });

  // ------------------------------------------------------------------
  // Data-driven parts: facts, animation, forest plot, quiz.
  // ------------------------------------------------------------------
  const METHODS = {
    naive: "Naive OLS (no controls)",
    full: "Full OLS (+ income)",
    step1: "FWL Step 1 (residualize X only)",
    step1int: "FWL Step 1 + intercept",
    step2: "FWL Step 2 (residualize both)",
    full2: "Full OLS (+ income + day)",
    fwl2: "FWL (+ income + day)",
  };
  let F = null;        // facts bound into the page
  let DATA = null;
  let anim = null;

  function buildFacts(d) {
    const row = key => {
      const r = d.estimates.find(e => e.method === METHODS[key]);
      if (!r) throw new Error(`results.json has no row named "${METHODS[key]}"`);
      return r;
    };
    const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
    const L = d.se_ladder;
    const naive = row("naive"), full = row("full"), s1 = row("step1"), s2 = row("step2");
    const full2 = row("full2"), fwl2 = row("fwl2");
    row("step1int");
    return {
      n_obs: d.n_obs,
      true_effect: d.true_effect,
      naive_b: naive.estimate, naive_se: naive.se, naive_p: naive.p,
      full_b: full.estimate, full_se: full.se, full_p: full.p, full_df: full.df_resid,
      step1_se: L.step1_no_intercept, step1_df: s1.df_resid,
      step1_int_se: L.step1_with_intercept,
      step1_dm_se: L.step1_demeaned_sales,
      step2_se: L.step2_residualize_both, step2_df: s2.df_resid,
      full2_b: full2.estimate, full2_se: full2.se, fwl2_b: fwl2.estimate,
      gamma_hat: d.ovb.gamma_hat,
      delta_hat: d.ovb.delta_hat,
      ovb_product: d.ovb.product,
      naive_minus_full: d.ovb.naive_minus_full,
      wrong_slope: d.ovb.wrong_direction_coupons_on_income,
      wrong_product: d.ovb.wrong_direction_product,
      pop_delta: d.ovb.population_delta,
      pop_plim: d.ovb.population_naive_plim,
      pop_bias: d.ovb.population_naive_plim - d.true_effect,
      se_ratio: d.se_ratio_step2_over_full,
      intercept_share: (L.step1_no_intercept - L.step1_with_intercept) /
                       (L.step1_no_intercept - L.full_model),
      mean_sales: mean(d.sample.sales),
      mean_coupons: mean(d.sample.coupons),
      scaled_b: d.scaled_residuals.estimate,
      scaled_se: d.scaled_residuals.se,
    };
  }

  function bindFacts() {
    document.querySelectorAll("[data-fact]").forEach(el => {
      const v = F[el.dataset.fact];
      if (el.dataset.pct !== undefined) el.textContent = pct(v, +el.dataset.pct);
      else el.textContent = fmt(v, +(el.dataset.dp || 4), el.dataset.plus === "1");
    });
  }

  // --- Tab 1 animation ------------------------------------------------
  function initAnimation(d) {
    const phaseBtns = Array.from(document.querySelectorAll(".anim-controls [data-phase]"));
    const playBtn = $("intro-play");
    anim = CHARTS.fwl_residualization_animation($("intro-anim"), d.sample, {
      title: $("intro-anim-title"),
      note: $("intro-anim-note"),
      onPhase: p => phaseBtns.forEach(b => b.setAttribute("aria-pressed", +b.dataset.phase === p ? "true" : "false")),
    });
    function syncPlay() {
      const on = anim.isPlaying();
      playBtn.textContent = on ? "Pause" : "Play";
      playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    phaseBtns.forEach(b => b.addEventListener("click", () => { anim.goTo(+b.dataset.phase); syncPlay(); }));
    playBtn.addEventListener("click", () => { anim.toggle(); syncPlay(); });
    anim.setActive(activePane === "pane-intro");
    syncPlay();
  }

  // --- Tab 3 forest plot ----------------------------------------------
  const fp = { chart: CHARTS.fwl_forest_plot($("fp-chart")) };
  function fp_refresh() {
    if (!DATA) return;
    const active = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
    fp.chart.update(DATA.estimates, active, DATA.true_effect);
    const rows = DATA.estimates.filter(r => active.includes(r.method));
    $("fp-table").innerHTML = rows.map(r =>
      `<tr><th scope="row">${r.method}</th><td>${fmt(r.estimate, 4)}</td><td>${fmt(r.se, 4)}</td>` +
      `<td class="ci">[${fmt(r.ci_lo, 3)}, ${fmt(r.ci_hi, 3)}]</td><td>${fmt(r.p, 3)}</td><td>${r.df_resid}</td></tr>`
    ).join("") || `<tr><td colspan="6">No methods selected.</td></tr>`;
  }
  document.querySelectorAll("#fp-methods input").forEach(el => el.addEventListener("change", fp_refresh));

  // --- Tab 5 quiz -----------------------------------------------------
  // One entry per question (same order as the .quiz cards); each maps a
  // data-pick value to feedback text built from the facts F.
  const QUIZ_FEEDBACK = [
    { // Q1 naive sign
      neg: F => `The naive slope is ${fmt(F.naive_b, 4)} (p = ${fmt(F.naive_p, 3)}). Richer neighborhoods redeem fewer coupons and spend more, so the raw slope mixes the coupon effect with income's effect and lands on the wrong side of zero.`,
      pos: F => `The naive slope is ${fmt(F.naive_b, 4)}, negative. Income pushes coupons down and sales up, and that backdoor path outweighs the true effect of ${fmt(F.true_effect, 2, true)}.`,
      zero: F => `It is not significant (p = ${fmt(F.naive_p, 3)}), but the point estimate is ${fmt(F.naive_b, 4)}, and the problem is bias, not noise: in large samples the naive slope converges to ${fmt(F.true_effect, 2)} + γ · δ = ${fmt(F.pop_plim, 2)}.`,
    },
    { // Q2 add income
      pos: F => `The coupon coefficient becomes ${fmt(F.full_b, 4, true)} (SE ${fmt(F.full_se, 4)}, p = ${fmt(F.full_p, 3)}), and income's own coefficient is ${fmt(F.gamma_hat, 4, true)}. Holding income fixed closes the backdoor path.`,
      same: F => `Controlling for income changes everything: the coefficient moves from ${fmt(F.naive_b, 4)} to ${fmt(F.full_b, 4, true)}. The gap, ${fmt(F.naive_minus_full, 4)}, equals ${G_HAT} · ${D_HAT} exactly: the in-sample omitted-variable-bias term (measured against the full-regression estimate, not the true ${fmt(F.true_effect, 2)}).`,
      exact: F => `Controlling for income removes the bias, not the noise. With ${F.n_obs} restaurants the estimate is ${fmt(F.full_b, 4, true)} (SE ${fmt(F.full_se, 4)}): within one standard error of ${fmt(F.true_effect, 2)}, but not equal to it.`,
    },
    { // Q3 OVB delta
      ionc: F => `Regressing income on coupons gives ${D_HAT} = ${fmt(F.delta_hat, 4)}, and ${G_HAT} · ${D_HAT} = ${fmt(F.gamma_hat, 4)} × (${fmt(F.delta_hat, 4)}) = ${fmt(F.ovb_product, 4)}, exactly naive − full = ${fmt(F.naive_b, 4)} − ${fmt(F.full_b, 4)}. The omitted variable goes on the left, the included regressor on the right.`,
      coni: F => `That is the partialling-out regression for coupons (the first half of the FWL recipe), with slope ${fmt(F.wrong_slope, 4)}. Plugging it in gives ${fmt(F.gamma_hat, 4)} × (${fmt(F.wrong_slope, 4)}) = ${fmt(F.wrong_product, 4)}, which does not reconcile the gap of ${fmt(F.naive_minus_full, 4)}. The OVB ${D_HAT} regresses the omitted variable (income) on the included regressor (coupons): ${fmt(F.delta_hat, 4)}.`,
      soni: F => `Sales on income is the partialling-out regression for sales; it does not describe how the omitted variable moves with coupons. ${D_HAT} comes from regressing income on coupons: ${fmt(F.delta_hat, 4)}, and ${G_HAT} · ${D_HAT} = ${fmt(F.ovb_product, 4)} = naive − full.`,
    },
    { // Q4 Step 1 SE
      intercept: F => `Raw sales average ${fmt(F.mean_sales, 2)}, and a no-intercept regression on mean-zero coupon residuals leaves that level in the residuals. Adding an intercept alone cuts the SE from ${fmt(F.step1_se, 4)} to ${fmt(F.step1_int_se, 4)}, closing ${pct(F.intercept_share, 0)} of the gap to the full model's ${fmt(F.full_se, 4)}. Removing income-driven variation from sales (Step 2) does the rest.`,
      income: F => `That explains only the last stretch. Simply demeaning sales, with no income adjustment at all, already brings the SE from ${fmt(F.step1_se, 4)} to ${fmt(F.step1_dm_se, 4)}; the dropped intercept is the main culprit. Residualizing sales on income then takes it down to ${fmt(F.step2_se, 4)}.`,
      df: F => `Step 1 actually has more residual df (${F.step1_df}) than the full model (${F.full_df}). A df change moves the SE by a factor near √(${F.step1_df}/${F.full_df}), about ${pct(Math.sqrt(F.step1_df / F.full_df) - 1, 0)}, not tenfold. The culprit is the dropped intercept: with one, the SE falls to ${fmt(F.step1_int_se, 4)}.`,
    },
    { // Q5 Step 2 vs full SE
      df: F => `Both regressions leave the same residuals, hence the same sum of squared residuals. Step 2 divides by ${F.step2_df} (n − 1: one regressor, no intercept); the full model divides by ${F.full_df} (n − 3: intercept, coupons, income). So ${fmt(F.step2_se, 4)} = ${fmt(F.full_se, 4)} × √(${F.full_df}/${F.step2_df}) = ${fmt(F.full_se, 4)} × ${fmt(F.se_ratio, 4)}. Use the full model's SE for inference.`,
      resid: F => `The residuals are identical; that is part of the FWL theorem. What differs is the degrees-of-freedom divisor: ${F.step2_df} in Step 2 vs. ${F.full_df} in the full model, so ${fmt(F.step2_se, 4)} = ${fmt(F.full_se, 4)} × √(${F.full_df}/${F.step2_df}).`,
      round: F => `The gap is systematic: ${fmt(F.step2_se, 4)} / ${fmt(F.full_se, 4)} = ${fmt(F.se_ratio, 4)} = √(${F.full_df}/${F.step2_df}). Same residuals, but Step 2 divides by ${F.step2_df} residual df instead of ${F.full_df}.`,
    },
    { // Q6 add means back
      no: F => `Adding constants shifts the cloud, not its tilt: the slope stays ${fmt(F.scaled_b, 4)} (SE ${fmt(F.scaled_se, 4)}). Only the intercept changes, which is why the post's scaled residual plot is safe for presentation.`,
      naive: F => `Adding a constant to every residual moves the points, not their relationship to each other. The slope stays ${fmt(F.scaled_b, 4)}; the naive ${fmt(F.naive_b, 4)} came from leaving income's influence inside both variables, and adding constants does not put that influence back.`,
      scale: F => `A slope is a ratio of covariance to variance, and adding constants changes neither. The slope stays ${fmt(F.scaled_b, 4)}; only the intercept absorbs the means.`,
    },
    { // Q7 DML
      partial: () => `DML replaces the two OLS partialling-out regressions (coupons on income, sales on income) with flexible machine-learning learners such as random forests or gradient boosting, and uses cross-fitting so each restaurant's residual comes from a model trained on other restaurants. The final step is still a residual-on-residual regression.`,
      final: () => `The last step stays essentially the same: regress the residualized outcome on the residualized treatment. What changes is how the residuals are produced: flexible ML learners with cross-fitting instead of OLS.`,
      controls: () => `DML still needs every confounder to be measured and included as a control. It relaxes the functional form of the partialling-out regressions, replacing OLS with flexible ML learners and cross-fitting; it does not remove the need for controls.`,
    },
  ];

  const quizCards = Array.from(document.querySelectorAll(".card.quiz"));
  const quizState = quizCards.map(() => ({ answered: false, correct: false }));
  function updateScore() {
    const answered = quizState.filter(s => s.answered).length;
    const correct = quizState.filter(s => s.correct).length;
    $("quiz-score").textContent = `Answered ${answered} of ${quizCards.length}` +
      (answered ? ` · ${correct} correct.` : ".");
  }
  quizCards.forEach((card, qi) => {
    const feedbackEl = card.querySelector(".quiz-feedback");
    const buttons = Array.from(card.querySelectorAll("button[data-pick]"));
    buttons.forEach(btn => {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        const pick = btn.dataset.pick;
        const correct = pick === card.dataset.answer;
        const fb = QUIZ_FEEDBACK[qi] || {};
        const body = F && fb[pick] ? fb[pick](F) : "Numbers are still loading; try again in a moment.";
        feedbackEl.innerHTML = (correct ? "✓ Correct. " : "✗ Not quite. ") + body;
        feedbackEl.hidden = false;
        feedbackEl.classList.toggle("right", correct);
        feedbackEl.classList.toggle("wrong", !correct);
        buttons.forEach(b => {
          b.classList.remove("picked-right", "picked-wrong");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add(correct ? "picked-right" : "picked-wrong");
        btn.setAttribute("aria-pressed", "true");
        quizState[qi] = { answered: true, correct };
        updateScore();
      });
    });
  });
  updateScore();

  // ------------------------------------------------------------------
  // Rendering of the active pane (tab switch + resize).
  // ------------------------------------------------------------------
  function renderActive() {
    if (anim) anim.setActive(activePane === "pane-intro");
    if (activePane === "pane-intro" && anim) anim.render();
    if (activePane === "pane-lab") lab.bars.render();
    if (activePane === "pane-forest") fp.chart.render();
    if (activePane === "pane-mc" && mc.hasRun) mc.hist.render();
  }
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    renderActive();
  }, 150));

  // ------------------------------------------------------------------
  // Boot: activate the pane named by the URL hash, then load results.json.
  // ------------------------------------------------------------------
  activateTab(paneFromHash(location.hash));

  fetch("data/results.json")
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(d => {
      DATA = d;
      F = buildFacts(d);
      bindFacts();
      initAnimation(d);
      fp_refresh();
      renderActive();
    })
    .catch(err => {
      const box = $("load-error");
      box.hidden = false;
      box.textContent = `Could not load data/results.json (${err.message || err}). ` +
        "If you opened this file directly (file://), serve the folder over HTTP instead.";
    });
})();
