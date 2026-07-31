/* app.js — wiring for the estimateW interactive lab. */

const ANCHORS = [2, 3, 5, 7, 10, 15, 20, 30, 44.5];
let DATA = null;

/* ---------- tabs ---------- */
function activate(paneId) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.toggle("active", p.id === paneId));
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.pane === paneId;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  // charts sized from a hidden container render at zero width, so redraw on show
  if (paneId === "pane-prior") renderPrior();
  if (paneId === "pane-net") renderNetwork();
  if (paneId === "pane-maps") renderMaps();
  if (paneId === "pane-intro") drawAudit(DATA);
}

document.querySelectorAll(".tab").forEach(t =>
  t.addEventListener("click", () => activate(t.dataset.pane)));
document.querySelectorAll("[data-goto]").forEach(a =>
  a.addEventListener("click", e => { e.preventDefault(); activate(a.dataset.goto); }));

/* ---------- tab 2: prior ---------- */
function renderPrior() {
  const idx = +document.getElementById("kbar").value;
  const kbar = ANCHORS[idx];
  const showFlat = document.getElementById("show-flat").checked;
  const n = DATA.meta.n;
  const b = ((n - 1) - kbar) / kbar;
  const p = kbar / (n - 1);

  document.getElementById("kbar-val").textContent = kbar;
  document.getElementById("stat-b").textContent = b.toFixed(2);
  document.getElementById("stat-p").textContent = (100 * p).toFixed(2) + "%";

  const note = document.getElementById("prior-note");
  if (kbar >= 44.5) {
    note.textContent = "This is the flat prior in disguise: an anchor of 44.5 is exactly what " +
      "rep(1, n) implies at n = 90. Every region is expected to neighbour half of Europe.";
  } else if (kbar <= 3) {
    note.textContent = `A very tight anchor. With k̄ = ${kbar} the prior insists on an extremely ` +
      "sparse network, and the likelihood has to fight hard to add any link at all.";
  } else if (kbar === 7) {
    note.textContent = "This is the value used in the published application, and in the post. " +
      "The data pulled the posterior slightly below it, to 6.47 neighbours on average.";
  } else {
    note.textContent = `An anchor of ${kbar} neighbours. Compare its spread with the flat prior: ` +
      "the point is not where the peak sits but how much mass the prior puts on dense networks.";
  }
  drawPrior(DATA, kbar, showFlat);
}
["kbar", "show-flat"].forEach(id =>
  document.getElementById(id).addEventListener("input", renderPrior));

/* ---------- tab 3: network ---------- */
function renderNetwork() {
  const thr = +document.getElementById("thr").value / 100;
  document.getElementById("thr-val").textContent = thr.toFixed(2);
  const row = DATA.thresholds.find(d => Math.abs(d.t - thr) < 1e-9) || DATA.thresholds[0];

  const fmtPct = v => v == null ? "—" : (100 * v).toFixed(1) + "%";
  document.getElementById("stat-n").textContent = row.n.toLocaleString();
  document.getElementById("stat-dist").textContent = row.dist == null ? "—" : Math.round(row.dist).toLocaleString() + " km";
  document.getElementById("stat-sc").textContent = fmtPct(row.same_country);
  document.getElementById("stat-q").textContent = fmtPct(row.queen);

  const note = document.getElementById("net-note");
  if (row.n === 0) {
    note.textContent = "No link is that certain.";
  } else {
    const encSc = row.same_country / DATA.baseline.same_country;
    const encQ = row.queen / DATA.baseline.queen;
    note.textContent =
      `At this threshold ${row.n.toLocaleString()} of 8,010 links survive. They are ` +
      `${encSc.toFixed(1)}× more likely to join regions of the same country than chance would ` +
      `predict, and ${encQ.toFixed(1)}× more likely to share a border. Raise the bar further and ` +
      `the national pattern strengthens faster than the geographic one.`;
  }
  drawThreshold(DATA, thr);
  drawDegree(DATA);
  drawLinksTable(DATA, thr);
}
document.getElementById("thr").addEventListener("input", renderNetwork);

/* ---------- tab 4: maps ---------- */
function renderMaps() {
  const v = document.querySelector('input[name="varsel"]:checked').value;
  drawMaps(DATA, v);
  drawAuc(DATA);

  const rows = DATA.three_maps.filter(d => d.var === v);
  const est = rows.find(d => d.map === "Estimated W");
  const qn = rows.find(d => d.map === "Queen contiguity");
  const ratioEst = est.indirect / est.direct, ratioQn = qn.indirect / qn.direct;
  const fold = Math.abs(est.total / qn.total);
  document.getElementById("maps-note").textContent =
    `Under the estimated map the total impact is ${est.total.toPrecision(4)}; under queen ` +
    `contiguity it is ${qn.total.toPrecision(4)} — a factor of ${fold.toFixed(2)}. The share of ` +
    `the effect that spills across borders moves from ${(100 * ratioQn / (1 + ratioQn)).toFixed(0)}% ` +
    `to ${(100 * ratioEst / (1 + ratioEst)).toFixed(0)}%. Every sign is unchanged; every magnitude is not.`;
}
document.querySelectorAll('input[name="varsel"]').forEach(r =>
  r.addEventListener("change", renderMaps));

/* ---------- boot ---------- */
fetch("data/results.json")
  .then(r => r.json())
  .then(d => {
    DATA = d;
    drawAudit(DATA);
    renderPrior();
    renderNetwork();
    renderMaps();
  })
  .catch(err => {
    const m = document.querySelector("main");
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = "Could not load data/results.json — " + err.message;
    m.prepend(p);
  });

window.addEventListener("resize", () => {
  const active = document.querySelector(".tab-pane.active");
  if (active && DATA) activate(active.id);
});
