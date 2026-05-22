// widget: bayesian-posterior — STUB
//
// Status: catalog entry only.
//
// Intended HTML PANE:
// -------------------
// <section class="tab-pane" role="tabpanel">
//   <h2>{{BP_TITLE}}</h2>
//   <p class="lede">{{BP_LEDE}}</p>
//   <div class="controls">
//     <div class="control"><label>Prior mean <span class="value" id="bp-m-val">0.0</span></label>
//       <input type="range" id="bp-m" min="-2" max="2" step="0.1" value="0.0"></div>
//     <div class="control"><label>Prior sd <span class="value" id="bp-s-val">1.0</span></label>
//       <input type="range" id="bp-s" min="0.1" max="3" step="0.1" value="1.0"></div>
//   </div>
//   <div class="chart-area" id="bp-density"></div>
//   <div class="card">
//     <p>Highlighted band: 95% credible interval. The orange curve is
//     the posterior; the steel-blue dashed curve is the prior.</p>
//   </div>
// </section>
//
// Intended JS contract:
// ---------------------
// - For conjugate Normal-Normal: closed-form posterior given prior
//   (m_0, s_0) and data sufficient statistics (n, ȳ, s²).
// - For non-conjugate: kernel-density over precomputed posterior draws
//   stored in data/posterior.json.
//
// PLACEHOLDER:
// ------------
// <section class="tab-pane"><h2>Bayesian Posterior Explorer (coming soon)</h2>
// <div class="card stub"><p>Placeholder. See widget catalog.</p></div></section>
