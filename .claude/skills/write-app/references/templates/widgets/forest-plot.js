// widget: forest-plot — READY (requires Pattern-A results.json)
//
// HTML PANE (insert into index.html.tmpl's {{TAB_PANES}}):
// --------------------------------------------------------
// <section id="pane-forest" class="tab-pane" role="tabpanel" aria-labelledby="tab-forest">
//   <h2>{{FOREST_TITLE}}</h2>
//   <p class="lede">{{FOREST_LEDE}}</p>
//   <div class="card">
//     <h3>Outcomes</h3>
//     <div class="outcome-toggle" id="fp-outcomes">{{OUTCOME_CHECKBOXES}}</div>
//     <h3 style="margin-top:16px;">Methods</h3>
//     <div class="method-toggle" id="fp-methods">{{METHOD_CHECKBOXES}}</div>
//   </div>
//   <div class="chart-area" id="fp-chart"></div>
//   <div class="chart-area" id="fp-bars"></div>
//   <div class="card">{{FOREST_PEDAGOGY}}</div>
// </section>
//
// JS INIT (insert into app.js.tmpl's {{WIDGET_INIT}}):
// ---------------------------------------------------
// (function initForestPlot() {
//   const chart = CHARTS.forest_plot(document.getElementById("fp-chart"));
//   const bars  = CHARTS.selection_bars(document.getElementById("fp-bars"));
//   let cached  = null;
//
//   function refresh() {
//     if (!cached) return;
//     const outcomes = Array.from(document.querySelectorAll("#fp-outcomes input:checked")).map(el => el.value);
//     const methods  = Array.from(document.querySelectorAll("#fp-methods input:checked")).map(el => el.value);
//     chart.update(cached.estimates, methods, outcomes);
//     bars.update(cached.selection || [], outcomes);
//   }
//   document.querySelectorAll("#fp-outcomes input, #fp-methods input").forEach(el => {
//     el.addEventListener("change", refresh);
//   });
//   // Loaded by the global data loader emitted into app.js.tmpl's {{DATA_LOADER}}.
//   window.__forestPlotConsume = function (data) { cached = data; refresh(); };
// })();
//
// DATA LOADER (insert into app.js.tmpl's {{DATA_LOADER}}):
// --------------------------------------------------------
// fetch("data/results.json").then(r => r.json()).then(data => {
//   if (typeof window.__forestPlotConsume === "function") window.__forestPlotConsume(data);
// }).catch(err => {
//   console.error("Failed to load results.json:", err);
//   document.getElementById("fp-chart").innerHTML =
//     '<div style="padding:20px;color:#d97757;">No real-data results available for this post. Use the simulator tab.</div>';
// });
