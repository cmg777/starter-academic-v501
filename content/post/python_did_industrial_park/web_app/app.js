// app.js — tab routing + widget glue for the Ethiopian industrial-parks lab.
(function () {
  "use strict";

  const tabs = ["event", "estimators", "hetero", "benefits"];

  function activateTab(id) {
    tabs.forEach((t) => {
      document.getElementById("pane-" + t).classList.toggle("active", t === id);
      const btn = document.querySelector(`.tab-strip button[data-tab="${t}"]`);
      btn.classList.toggle("active", t === id);
      btn.setAttribute("aria-selected", String(t === id));
    });
  }
  document.querySelectorAll(".tab-strip button").forEach((b) =>
    b.addEventListener("click", () => activateTab(b.dataset.tab))
  );

  const fmt = (v, d = 3) => (v >= 0 ? "+" : "") + v.toFixed(d);

  fetch("data/results.json")
    .then((r) => r.json())
    .then((DATA) => init(DATA))
    .catch((e) => {
      const card = document.createElement("div");
      card.className = "card";
      const p = document.createElement("p");
      p.className = "note";
      p.textContent = `Could not load data/results.json (${e}). The app needs to be served over HTTP, not opened as a file://.`;
      card.appendChild(p);
      document.getElementById("pane-event").appendChild(card);
    });

  function init(DATA) {
    // ───────────────────────── TAB 1: event study ─────────────────────
    const es = CHARTS.event_study(document.getElementById("event-chart"));
    const ctl = {
      horizon: document.getElementById("s-horizon"),
      nTreated: document.getElementById("s-ntreated"),
      pretrend: document.getElementById("s-pretrend"),
    };
    let esSeed = 7;
    let lastSim = null;

    function readSimOpts(seed) {
      return {
        nTreated: +ctl.nTreated.value,
        nControl: 122,
        amplitude: 1,
        pretrend: +ctl.pretrend.value,
        noise: 0.06,
        seed: seed,
      };
    }
    function refreshEventLabels() {
      document.getElementById("v-horizon").textContent = ctl.horizon.value;
      document.getElementById("v-ntreated").textContent = ctl.nTreated.value;
      document.getElementById("v-pretrend").textContent = (+ctl.pretrend.value).toFixed(3);
    }
    function drawEvent(newSim) {
      refreshEventLabels();
      if (newSim) lastSim = DGP.simulate_event_study(readSimOpts(++esSeed));
      es.update(DATA.event_study_light, {
        horizon: +ctl.horizon.value,
        sim: lastSim,
      });
    }
    // horizon/pretrend slider also redraws sim so the pretrend slope is visible
    ctl.horizon.addEventListener("input", () => drawEvent(false));
    ctl.nTreated.addEventListener("input", () => drawEvent(true));
    ctl.pretrend.addEventListener("input", () => drawEvent(true));
    document.getElementById("resim").addEventListener("click", () => drawEvent(true));
    drawEvent(true);

    // ────────────────────── TAB 2: estimator comparison ───────────────
    const ef = CHARTS.estimator_forest(document.getElementById("estimator-chart"));
    ef.update(DATA.estimators);

    const bc = CHARTS.bacon_scatter(document.getElementById("bacon-chart"));
    const cbForbidden = document.getElementById("cb-forbidden");
    function drawBacon() { bc.update(DATA.bacon, cbForbidden.checked); }
    cbForbidden.addEventListener("change", drawBacon);
    drawBacon();

    // ───────────────────────── TAB 3: heterogeneity ───────────────────
    const hd = CHARTS.het_decay(document.getElementById("het-chart"));
    const modToggle = document.getElementById("mod-toggle");
    // all moderators (distance + roads); attach axis labels/units
    const mods = DATA.het_distance.map((m) => ({ ...m, unit: m.label + " (km)" }))
      .concat(DATA.het_roads.map((m) => ({ ...m, unit: m.label + " (units)" })));
    let activeMod = mods[2]; // distance-to-nearest-city (steepest, the figure's headline)
    let markerX = activeMod.axis_max * 0.25;

    function refreshHetStats(mod, xv) {
      const eff = mod.main_treatment + mod.interaction * xv;
      document.getElementById("st-eff").textContent = fmt(eff, 2);
      document.getElementById("st-eff").className = "stat-value " + (eff >= 0 ? "teal" : "orange");
      document.getElementById("st-eff-sub").textContent = `raw light @ ${xv.toFixed(0)}`;
      document.getElementById("st-slope").textContent = fmt(mod.interaction, 4);
      document.getElementById("st-slope").className = "stat-value " + (mod.interaction < 0 ? "orange" : "teal");
      document.getElementById("st-slope-sub").textContent = mod.interaction < 0 ? "negative → effect fades" : "positive → roads amplify";
      const sigEl = document.getElementById("st-mod-sig");
      const sig = mod.stars || "ns";
      sigEl.textContent = sig === "" ? "ns" : sig;
      sigEl.className = "stat-value " + ((sig && sig !== "ns") ? "teal" : "orange");
      document.getElementById("st-mod-sig-sub").textContent = `t = ${mod.t.toFixed(2)} (SE ${mod.se.toFixed(4)})`;
    }
    function drawHet() {
      refreshHetStats(activeMod, markerX);
      hd.update(activeMod, markerX, (xv) => { markerX = xv; drawHet(); });
    }
    mods.forEach((m, i) => {
      const label = document.createElement("label");
      const rb = document.createElement("input");
      rb.type = "radio"; rb.name = "moderator"; rb.value = i; rb.checked = (m === activeMod);
      rb.addEventListener("change", () => { activeMod = m; markerX = m.axis_max * 0.25; drawHet(); });
      label.appendChild(rb);
      label.appendChild(document.createTextNode(" " + m.label));
      modToggle.appendChild(label);
    });
    drawHet();

    // ───────────────────────── TAB 4: who benefits ────────────────────
    const of = CHARTS.outcome_forest(document.getElementById("benefit-chart"));
    const sets = {
      household: DATA.household,
      employment: DATA.employment,
      empowerment: DATA.empowerment,
    };
    function drawBenefit(which) { of.update(sets[which]); }
    document.querySelectorAll('input[name="benefit"]').forEach((rb) =>
      rb.addEventListener("change", () => { if (rb.checked) drawBenefit(rb.value); })
    );
    drawBenefit("household");

    // employment stat cards (static from the data)
    const emp = {};
    DATA.employment.forEach((r) => { emp[r.label] = r.estimate; });
    document.getElementById("st-emp-full").textContent = fmt(emp["Full sample"]);
    document.getElementById("st-emp-women").textContent = fmt(emp["Women"]);
    document.getElementById("st-emp-men").textContent = fmt(emp["Men"]);

    // RCS phase event studies (durables + female employment)
    const pe = CHARTS.phase_event_study(document.getElementById("rcs-event-chart"));
    pe.update([
      { name: "Household durables", color: "#d97757", points: DATA.household_event_study },
      { name: "Women's non-ag employment", color: "#00d4c8", points: DATA.female_employment_event_study },
    ]);

    activateTab("event");
  }
})();
