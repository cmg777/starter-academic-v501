// widget: did-event-study — STUB
//
// Status: documented contract only. The skill renders a placeholder
// card when this widget is selected. Promote to READY when a DiD post
// (e.g. r_staggered_did) needs an app.
//
// Intended HTML PANE:
// -------------------
// <section id="pane-did" class="tab-pane" role="tabpanel">
//   <h2>{{DID_TITLE}}</h2>
//   <p class="lede">{{DID_LEDE}}</p>
//   <div class="controls">
//     <div class="control"><label>Event window <span class="value" id="did-w-val">±5</span></label>
//       <input type="range" id="did-w" min="3" max="10" step="1" value="5"></div>
//     <div class="control"><label>Show control trajectory <span class="value" id="did-c-val">on</span></label>
//       <input type="checkbox" id="did-c" checked></div>
//   </div>
//   <div class="chart-area" id="did-trajectories"></div>
//   <div class="chart-area" id="did-event-study"></div>
//   <div class="pedagogy">{{DID_PEDAGOGY}}</div>
// </section>
//
// Intended JS contract (not yet wired):
// -------------------------------------
// - Reads data/results.json's `event_study` array and `trajectories` object
//   (treated[] and control[]).
// - Draws two synchronised D3 charts: trajectories on top, event-study
//   coefficients on the bottom with a vertical reference at lag 0.
// - The event-window slider re-bins the displayed lags without
//   recomputing the estimates (which are precomputed in R/Python).
//
// PLACEHOLDER (what the skill emits for now):
// -------------------------------------------
// <section id="pane-did" class="tab-pane" role="tabpanel">
//   <h2>DiD Event-Study (coming soon)</h2>
//   <div class="card stub">
//     <p>This tab is a placeholder for the DiD event-study widget. The
//     widget is documented in <a href="https://github.com/cmg777/starter-academic-v501/blob/master/.claude/skills/write-app/references/widget-catalog.md#5-did-event-study-explorer--stub">the catalog</a>
//     and will be implemented when the next DiD post ships.</p>
//   </div>
// </section>
