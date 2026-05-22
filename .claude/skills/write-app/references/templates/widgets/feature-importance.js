// widget: feature-importance — STUB
//
// Status: catalog entry only.
//
// Intended HTML PANE:
// -------------------
// <section id="pane-fi" class="tab-pane" role="tabpanel">
//   <h2>{{FI_TITLE}}</h2>
//   <p class="lede">{{FI_LEDE}}</p>
//   <div class="controls">
//     <div class="control"><label>Top K features <span class="value" id="fi-k-val">10</span></label>
//       <input type="range" id="fi-k" min="5" max="30" step="1" value="10"></div>
//     <div class="control"><label>PDP feature</label>
//       <select id="fi-pdp-feature"></select></div>
//   </div>
//   <div class="chart-area" id="fi-bars"></div>
//   <div class="chart-area" id="fi-pdp"></div>
// </section>
//
// Intended JS contract:
// ---------------------
// - Reads data/results.json's `feature_importance[]` and `pdp` object.
// - Bar chart of top-K features by `value`. Dropdown picks the focal
//   feature; second chart shows its partial-dependence curve.
//
// PLACEHOLDER:
// ------------
// <section class="tab-pane" role="tabpanel">
//   <h2>Feature Importance (coming soon)</h2>
//   <div class="card stub"><p>Placeholder. See the widget catalog for
//   the intended contract.</p></div>
// </section>
