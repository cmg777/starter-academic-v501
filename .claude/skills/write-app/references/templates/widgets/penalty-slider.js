// widget: penalty-slider — READY
//
// HTML PANE (insert into index.html.tmpl's {{TAB_PANES}}):
// --------------------------------------------------------
// <section id="pane-lab" class="tab-pane" role="tabpanel" aria-labelledby="tab-lab">
//   <h2>{{LAB_TITLE}}</h2>
//   <p class="lede">{{LAB_LEDE}}</p>
//   <div class="controls">
//     <div class="control"><label>Sample size n <span class="value" id="lab-n-val">200</span></label>
//       <input type="range" id="lab-n" min="50" max="500" step="10" value="200" aria-label="sample size n"></div>
//     <div class="control"><label>Number of controls p <span class="value" id="lab-p-val">40</span></label>
//       <input type="range" id="lab-p" min="5" max="100" step="1" value="40" aria-label="number of controls p"></div>
//     <div class="control"><label>Signal strength <span class="value" id="lab-s-val">0.60</span></label>
//       <input type="range" id="lab-s" min="0.1" max="1.5" step="0.05" value="0.60" aria-label="signal strength"></div>
//     <div class="control"><label>Penalty <span class="value" id="lab-l-val">—</span></label>
//       <input type="range" id="lab-l" min="0" max="79" step="1" value="40" aria-label="penalty index"></div>
//   </div>
//   <div class="chart-area" id="lab-path"></div>
//   <div class="stat-row">
//     <div class="stat"><div class="stat-label">controls kept (|I|)</div>
//       <div class="stat-value teal" id="lab-stat-nz">—</div></div>
//     <div class="stat"><div class="stat-label">α̂ from raw LASSO</div>
//       <div class="stat-value orange" id="lab-stat-alpha-l">—</div></div>
//     <div class="stat"><div class="stat-label">α̂ from post-OLS</div>
//       <div class="stat-value orange" id="lab-stat-alpha-o">—</div></div>
//     <div class="stat"><div class="stat-label">true α</div>
//       <div class="stat-value" id="lab-stat-alpha-t">0.50</div></div>
//   </div>
//   <div class="pedagogy">{{PEDAGOGY_BULLETS}}</div>
// </section>
//
// JS INIT (insert into app.js.tmpl's {{WIDGET_INIT}}):
// ---------------------------------------------------
// (function initPenaltySlider() {
//   const state = { n: 200, p: 40, signal: 0.6, lambdaIdx: 40, seed: 1, path: null };
//   const chart = CHARTS.coefficient_path(document.getElementById("lab-path"));
//
//   function refit() {
//     const sim = DGP.simulate_lasso({ n: state.n, p: state.p, signal: state.signal, seed: state.seed });
//     state.sim = sim;
//     state.path = LASSO.lasso_path(sim.X, sim.y, sim.n, sim.p, { nLam: 80, maxIter: 60, tol: 1e-5 });
//     render();
//   }
//
//   function render() {
//     if (!state.path) return;
//     const k = Math.max(0, Math.min(state.path.lambdas.length - 1, state.lambdaIdx));
//     const lambda = state.path.lambdas[k];
//     const beta = state.path.betas[k];
//     chart.update(state.path, lambda);
//     document.getElementById("lab-l-val").textContent = lambda.toExponential(2);
//     let nz = 0;
//     for (let j = 0; j < beta.length; j++) if (Math.abs(beta[j]) > 1e-9) nz++;
//     document.getElementById("lab-stat-nz").textContent = nz;
//     document.getElementById("lab-stat-alpha-l").textContent = beta[0].toFixed(3);
//     // post-OLS:
//     const support = [];
//     for (let j = 1; j < beta.length; j++) if (Math.abs(beta[j]) > 1e-9) support.push(j);
//     const n = state.sim.n, p = state.sim.p;
//     const d = new Float64Array(n);
//     for (let i = 0; i < n; i++) d[i] = state.sim.X[i * p];
//     const Xs = LASSO.subset_columns(state.sim.X, n, p, support);
//     const ols = LASSO.ols_with_treatment(d, Xs, state.sim.y, n, support.length);
//     document.getElementById("lab-stat-alpha-o").textContent = ols ? ols.alpha_hat.toFixed(3) : "—";
//   }
//
//   const onParam = debounce(refit, 80);
//   ["lab-n", "lab-p", "lab-s"].forEach(id => {
//     document.getElementById(id).addEventListener("input", e => {
//       const v = +e.target.value;
//       if (id === "lab-n") { state.n = v; document.getElementById("lab-n-val").textContent = v; }
//       if (id === "lab-p") { state.p = v; document.getElementById("lab-p-val").textContent = v; }
//       if (id === "lab-s") { state.signal = v; document.getElementById("lab-s-val").textContent = v.toFixed(2); }
//       onParam();
//     });
//   });
//   document.getElementById("lab-l").addEventListener("input", e => {
//     state.lambdaIdx = +e.target.value;
//     render();
//   });
//   refit();
// })();
