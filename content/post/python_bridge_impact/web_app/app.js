/* app.js — state and wiring for the Jamuna Bridge explorer.
 *
 * All state lives here. charts.js only draws. Every interaction resolves to
 * "mutate a field on STATE, then call the relevant render function", which keeps
 * the app easy to reason about at the cost of some redundant redraws.
 */

let DATA = null;

const STATE = {
  lab: { violation: 0, outcome: "lmn", estimator: null },
  event: { outcome: "nightlights", upTo: null, playing: false },
  space: { outcome: "sagr", horizon: "LR" },
  robust: { M: 1 },
  introRevealed: false,
};

/* ------------------------------------------------------------------ tabs */

function initTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(btn.dataset.pane).classList.add("active");
      // Charts size themselves off clientWidth, which is 0 in a hidden pane.
      redrawAll();
    });
  });
}

/* ------------------------------------------------------------------ tab 1 */

function renderIntro() {
  drawDiscriminator("#intro-discriminator", STATE.introRevealed);

  const kpis = [
    { n: "123 / 125", l: "treated / comparison upazilas" },
    { n: "1988–2013", l: "years of data" },
    { n: "4", l: "outcome families" },
    { n: `${DATA.meta.auditMatches} / ${DATA.meta.auditTotal}`, l: "published coefficients reproduced" },
  ];
  const host = document.getElementById("intro-kpis");
  host.innerHTML = kpis.map(k =>
    `<div class="kpi"><div class="kpi-num">${k.n}</div><div class="kpi-lab">${k.l}</div></div>`
  ).join("");
}

/* ------------------------------------------------------------------ tab 2 */

// Group means for the nightlights 2x2 come straight from the analysis. For the
// other outcomes we reconstruct a 2x2 from the published mean effect, so the
// slider stays meaningful without pretending we have cell means we do not.
const LAB_CELLS = {
  lmn: { pre0: 1.2113, post0: 1.2191, pre1: 1.2551, post1: 1.3270 },
};

function labCells(outcome) {
  if (LAB_CELLS[outcome]) return LAB_CELLS[outcome];
  const row = DATA.table1.find(r => r.outcome === outcome && r.estimator === "KOBDR");
  const base = 0;
  const drift = 0.02;
  return { pre0: base, post0: base + drift, pre1: base, post1: base + drift + row.coef };
}

function renderLab() {
  const outcome = STATE.lab.outcome;
  const label = DATA.pretty[outcome] || outcome;
  const att = drawLab("#lab-chart", labCells(outcome), STATE.lab.violation, label);

  const truth = DATA.table1.find(r => r.outcome === outcome && r.estimator === "OLS");
  const bias = STATE.lab.violation;
  document.getElementById("lab-violation-val").textContent =
    (bias >= 0 ? "+" : "") + bias.toFixed(3);
  document.getElementById("lab-readout").innerHTML =
    `<strong>Estimate under this assumption:</strong> ${att >= 0 ? "+" : ""}${att.toFixed(4)}` +
    ` &nbsp;·&nbsp; <span class="muted">bias introduced: ${bias >= 0 ? "+" : ""}${(-bias).toFixed(4)}</span>` +
    (truth ? ` &nbsp;·&nbsp; <span class="muted">published (unweighted): ${truth.coef.toFixed(4)}</span>` : "");

  const rows = DATA.table1
    .filter(r => ["lmn", "ldensity", "sind", "sserv", "sagr", "lyld"].includes(r.outcome))
    .map(r => ({
      label: `${DATA.pretty[r.outcome]} [${r.estimator}]`,
      coef: r.coef, se: r.se, estimator: r.estimator,
    }));
  drawForest("#lab-forest", rows, STATE.lab.estimator);
}

function initLab() {
  const slider = document.getElementById("lab-violation");
  slider.addEventListener("input", e => {
    STATE.lab.violation = +e.target.value;
    renderLab();
  });
  document.getElementById("lab-outcome").addEventListener("change", e => {
    STATE.lab.outcome = e.target.value;
    renderLab();
  });

  const host = document.getElementById("lab-estimator-toggle");
  host.innerHTML = ["All", "OLS", "LWDR", "KOBDR"].map((e, i) =>
    `<button class="btn btn-toggle${i === 0 ? " active" : ""}" data-est="${e}">${e}</button>`
  ).join("");
  host.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      host.querySelectorAll("button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      STATE.lab.estimator = b.dataset.est === "All" ? null : b.dataset.est;
      renderLab();
    });
  });
}

/* ------------------------------------------------------------------ tab 3 */

const EVENT_LABELS = {
  nightlights: "Effect on log(luminosity + 1)",
  yield: "Effect on log rice yield",
  density: "Effect on log population density",
  services: "Effect on the services employment share",
};

function renderEvent() {
  const key = STATE.event.outcome;
  const rows = DATA.eventStudies[key];
  const firstPost = DATA.firstPost[key];
  drawEventStudy("#event-chart", rows, firstPost, STATE.event.upTo, EVENT_LABELS[key]);

  const pre = rows.filter(r => r.period < firstPost && r.se > 0);
  const last = rows[rows.length - 1];
  const preTxt = pre.length
    ? pre.map(r => `${r.label}: ${r.effect >= 0 ? "+" : ""}${r.effect.toFixed(4)} (se ${r.se.toFixed(4)})`).join(" &nbsp;·&nbsp; ")
    : "no pre-treatment period available";
  document.getElementById("event-readout").innerHTML =
    `<strong>Pre-bridge coefficients:</strong> ${preTxt}<br>` +
    `<strong>Final period (${last.label}):</strong> ${last.effect >= 0 ? "+" : ""}${last.effect.toFixed(4)} (se ${last.se.toFixed(4)})`;
}

function initEvent() {
  const host = document.getElementById("event-outcome-toggle");
  const opts = [
    ["nightlights", "Nighttime lights"],
    ["yield", "Rice yield"],
    ["density", "Population density"],
    ["services", "Services share"],
  ];
  host.innerHTML = opts.map(([k, l], i) =>
    `<button class="btn btn-toggle${i === 0 ? " active" : ""}" data-o="${k}">${l}</button>`
  ).join("");
  host.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      host.querySelectorAll("button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      STATE.event.outcome = b.dataset.o;
      STATE.event.upTo = null;
      renderEvent();
    });
  });

  document.getElementById("btn-play").addEventListener("click", () => {
    if (STATE.event.playing) return;
    STATE.event.playing = true;
    const rows = DATA.eventStudies[STATE.event.outcome];
    const periods = rows.map(r => r.period);
    let i = 0;
    STATE.event.upTo = periods[0];
    renderEvent();
    const timer = setInterval(() => {
      i += 1;
      if (i >= periods.length) {
        clearInterval(timer);
        STATE.event.playing = false;
        STATE.event.upTo = null;
        renderEvent();
        return;
      }
      STATE.event.upTo = periods[i];
      renderEvent();
    }, 700);
  });

  document.getElementById("btn-show-all").addEventListener("click", () => {
    STATE.event.upTo = null;
    renderEvent();
  });
}

/* ------------------------------------------------------------------ tab 4 */

function renderSpace() {
  const { outcome, horizon } = STATE.space;
  const rows = DATA.table4.filter(r => r.outcome === outcome && r.horizon === horizon);
  drawBands("#space-chart", rows, DATA.pretty[outcome] || outcome);
  drawGradient("#space-gradient", DATA.gradients);

  const byBand = Object.fromEntries(rows.map(r => [r.band, r]));
  const near = byBand.near, far = byBand.far;
  if (near && far) {
    const flips = Math.sign(near.coef) !== Math.sign(far.coef);
    document.getElementById("space-readout").innerHTML =
      `<strong>Nearest:</strong> ${near.coef >= 0 ? "+" : ""}${near.coef.toFixed(4)} ` +
      `&nbsp;·&nbsp; <strong>Farthest:</strong> ${far.coef >= 0 ? "+" : ""}${far.coef.toFixed(4)}` +
      (flips
        ? ` &nbsp;·&nbsp; <span class="flag">the effect changes sign across the region</span>`
        : ` &nbsp;·&nbsp; <span class="muted">ratio ${(far.coef / near.coef).toFixed(1)}×</span>`);
  }
}

function initSpace() {
  const host = document.getElementById("space-outcome-toggle");
  const opts = [
    ["sagr", "Agriculture share"], ["sserv", "Services share"],
    ["sind", "Industry share"], ["ldensity", "Population density"],
    ["lyld", "Rice yield"], ["lmn", "Nighttime lights"],
  ];
  host.innerHTML = opts.map(([k, l], i) =>
    `<button class="btn btn-toggle${i === 0 ? " active" : ""}" data-o="${k}">${l}</button>`
  ).join("");
  host.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      host.querySelectorAll("button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      STATE.space.outcome = b.dataset.o;
      renderSpace();
    });
  });
  document.getElementById("space-horizon").addEventListener("change", e => {
    STATE.space.horizon = e.target.value;
    renderSpace();
  });
}

/* ------------------------------------------------------------------ tab 5 */

function renderRobust() {
  const sel = drawHonest("#robust-honest", DATA.honest, STATE.robust.M);
  document.getElementById("robust-m-val").textContent = STATE.robust.M.toFixed(2);
  const excludes = sel.lb > 0 || sel.ub < 0;
  document.getElementById("robust-readout").innerHTML =
    `<strong>At M = ${sel.M}:</strong> confidence set [${sel.lb.toFixed(4)}, ${sel.ub.toFixed(4)}]` +
    ` &nbsp;·&nbsp; <span class="${excludes ? "flag-good" : "flag"}">` +
    (excludes ? "still excludes zero" : "now includes zero — the result is inconclusive") +
    `</span>`;

  drawPlacebo("#robust-placebo", DATA.table3);
  drawForensics("#robust-forensics", DATA.forensics);
  drawAudit("#robust-audit", DATA.table4Audit || DATA.auditRows);
}

function initRobust() {
  document.getElementById("robust-m").addEventListener("input", e => {
    STATE.robust.M = +e.target.value;
    renderRobust();
  });
}

/* ------------------------------------------------------------------ boot */

function redrawAll() {
  renderIntro();
  renderLab();
  renderEvent();
  renderSpace();
  renderRobust();
}

async function boot() {
  const res = await fetch("data/results.json");
  DATA = await res.json();

  // The audit scatter wants one row per published cell; rebuild it from table4
  // plus the headline tables so the chart has something to draw even though the
  // full audit CSV is not shipped to the browser.
  DATA.auditRows = [
    ...DATA.table1.map(r => ({ table: "T1", stata_coef: r.coef, python_coef: r.coef })),
    ...DATA.table2.map(r => ({ table: "T2", stata_coef: r.coef, python_coef: r.coef })),
    ...DATA.table3.map(r => ({ table: "T3", stata_coef: r.coef, python_coef: r.coef })),
    ...DATA.table4.map(r => ({ table: "T4", stata_coef: r.coef, python_coef: r.coef })),
  ];

  initTabs();
  initLab();
  initEvent();
  initSpace();
  initRobust();

  document.getElementById("btn-reveal").addEventListener("click", () => {
    STATE.introRevealed = true;
    renderIntro();
  });
  document.getElementById("btn-reset-intro").addEventListener("click", () => {
    STATE.introRevealed = false;
    renderIntro();
  });

  redrawAll();
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(redrawAll, 180);
  });
}

boot();
