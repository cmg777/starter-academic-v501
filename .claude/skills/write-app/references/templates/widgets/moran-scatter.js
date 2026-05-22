// widget: moran-scatter — STUB
//
// Status: catalog entry only. Requires GeoJSON + spatial weight matrix.
//
// Intended HTML PANE:
// -------------------
// <section class="tab-pane" role="tabpanel">
//   <h2>{{MORAN_TITLE}}</h2>
//   <p class="lede">{{MORAN_LEDE}}</p>
//   <div class="grid grid-2">
//     <div class="chart-area" id="moran-map"></div>
//     <div class="chart-area" id="moran-scatter"></div>
//   </div>
//   <div class="controls">
//     <div class="control"><label>Weight matrix W</label>
//       <select id="moran-w"><option>Queen</option><option>Rook</option><option>k-NN (k=5)</option></select></div>
//   </div>
// </section>
//
// Intended JS contract:
// ---------------------
// - Reads data/regions.geojson and data/weights.json (adjacency lists).
// - Renders a choropleth via d3.geoPath + a projection; renders the
//   Moran scatter (z_i vs Wz_i) with a fitted regression line.
// - Brushing a region on the map highlights it on the scatter.
//
// PLACEHOLDER:
// ------------
// <section class="tab-pane"><h2>Moran's I scatter (coming soon)</h2>
// <div class="card stub"><p>Placeholder. See widget catalog.</p></div></section>
