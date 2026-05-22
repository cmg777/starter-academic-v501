// widget: train-test-split — STUB
//
// Status: catalog entry only.
//
// Intended HTML PANE:
// -------------------
// <section class="tab-pane" role="tabpanel">
//   <h2>{{TTS_TITLE}}</h2>
//   <p class="lede">{{TTS_LEDE}}</p>
//   <div class="controls">
//     <div class="control"><label>Train fraction <span class="value" id="tts-f-val">0.70</span></label>
//       <input type="range" id="tts-f" min="0.3" max="0.9" step="0.05" value="0.7"></div>
//     <div class="control"><label>Folds (K) <span class="value" id="tts-k-val">5</span></label>
//       <input type="range" id="tts-k" min="2" max="10" step="1" value="5"></div>
//   </div>
//   <div class="chart-area" id="tts-fold-grid"></div>
//   <div class="chart-area" id="tts-mse-bars"></div>
// </section>
//
// Intended JS contract:
// ---------------------
// - Runs against the existing simulated DGP (no real data needed).
// - Fold-grid: visualise the train/test partition as a horizontal
//   strip per fold.
// - MSE bars: train MSE vs held-out MSE per fold, with the mean line.
//
// PLACEHOLDER:
// ------------
// <section class="tab-pane"><h2>Train/Test Split (coming soon)</h2>
// <div class="card stub"><p>Placeholder. See widget catalog.</p></div></section>
