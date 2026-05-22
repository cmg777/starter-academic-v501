// widget: sensitivity-heatmap — STUB
//
// Status: catalog entry only.
//
// Intended HTML PANE:
// -------------------
// <section class="tab-pane" role="tabpanel">
//   <h2>{{SH_TITLE}}</h2>
//   <p class="lede">{{SH_LEDE}}</p>
//   <div class="chart-area" id="sh-heatmap"></div>
//   <div class="card" id="sh-frozen-detail">
//     <h3>Frozen parameters</h3>
//     <p class="muted">Click a heatmap cell to freeze the (x, y) pair
//     and inspect the corresponding regression below.</p>
//   </div>
// </section>
//
// Intended JS contract:
// ---------------------
// - Reads data/results.json's `sensitivity[]`: each row {x_param,
//   y_param, estimate}.
// - Renders a D3 heatmap with a diverging color scale centred at 0.
// - Click-to-freeze updates the detail card with the row's full info.
//
// PLACEHOLDER:
// ------------
// <section class="tab-pane"><h2>Sensitivity Heatmap (coming soon)</h2>
// <div class="card stub"><p>Placeholder. See widget catalog.</p></div></section>
