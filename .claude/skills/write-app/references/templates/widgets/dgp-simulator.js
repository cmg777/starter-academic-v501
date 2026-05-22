// widget: dgp-simulator — READY
//
// HTML PANE (insert into index.html.tmpl's {{TAB_PANES}}):
// --------------------------------------------------------
// <section id="pane-showdown" class="tab-pane" role="tabpanel" aria-labelledby="tab-showdown">
//   <h2>{{SIM_TITLE}}</h2>
//   <p class="lede">{{SIM_LEDE}}</p>
//   <div class="controls">
//     <div class="control"><label>Sample size n <span class="value" id="sh-n-val">200</span></label>
//       <input type="range" id="sh-n" min="50" max="300" step="10" value="200"></div>
//     <div class="control"><label>Number of controls p <span class="value" id="sh-p-val">40</span></label>
//       <input type="range" id="sh-p" min="5" max="50" step="1" value="40"></div>
//     <div class="control"><label>Signal <span class="value" id="sh-s-val">0.50</span></label>
//       <input type="range" id="sh-s" min="0.1" max="1.2" step="0.05" value="0.50"></div>
//     <div class="control"><label>{{ASYM_LABEL}} <span class="value" id="sh-a-val">0.80</span></label>
//       <input type="range" id="sh-a" min="0" max="1" step="0.05" value="0.80"></div>
//   </div>
//   <div class="grid grid-2">
//     <div class="card">
//       <h3><span class="tag rigorous">{{METHOD_A_NAME}}</span></h3>
//       <div class="method-row"><span class="label">α̂</span><span class="val" id="sh-rig-alpha">—</span></div>
//       <div class="method-row"><span class="label">SE(α̂)</span><span class="val" id="sh-rig-se">—</span></div>
//       <div class="method-row"><span class="label">|I_y|</span><span class="val" id="sh-rig-iy">—</span></div>
//       <div class="method-row"><span class="label">|I_d|</span><span class="val" id="sh-rig-id">—</span></div>
//       <div class="method-row"><span class="label">union</span><span class="val" id="sh-rig-un">—</span></div>
//     </div>
//     <div class="card">
//       <h3><span class="tag cv">{{METHOD_B_NAME}}</span></h3>
//       <div class="method-row"><span class="label">α̂</span><span class="val" id="sh-cv-alpha">—</span></div>
//       <div class="method-row"><span class="label">SE(α̂)</span><span class="val" id="sh-cv-se">—</span></div>
//       <div class="method-row"><span class="label">|I_y|</span><span class="val" id="sh-cv-iy">—</span></div>
//       <div class="method-row"><span class="label">|I_d|</span><span class="val" id="sh-cv-id">—</span></div>
//       <div class="method-row"><span class="label">union</span><span class="val" id="sh-cv-un">—</span></div>
//     </div>
//   </div>
//   <div class="chart-area" id="sh-compare"></div>
//   <div class="card">
//     <h3>Bias vs variance over many simulations</h3>
//     <button class="action" id="sh-run">Run 100 simulations</button>
//     <div class="progress-bar" id="sh-progress"><div></div></div>
//     <div class="chart-area" id="sh-hist" style="display:none;"></div>
//   </div>
// </section>
//
// JS INIT (insert into app.js.tmpl's {{WIDGET_INIT}}):
// ---------------------------------------------------
// (function initDGPSimulator() {
//   const state = { n: 200, p: 40, signal: 0.5, asymmetry: 0.80, seed: 7 };
//   const cmp = CHARTS.alpha_compare(document.getElementById("sh-compare"));
//   const hist = CHARTS.alpha_histograms(document.getElementById("sh-hist"));
//
//   function refit() {
//     const sim = DGP.simulate_dl({ n: state.n, p: state.p, signal: state.signal,
//                                   asymmetry: state.asymmetry, seed: state.seed });
//     state.sim = sim;
//     const rig = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "rigorous");
//     const cvr = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "cv",
//                                    { nLam: 50, seed: state.seed });
//     // populate stat rows...
//     ["alpha","se","iy","id","un"].forEach(k => {
//       const v = { alpha: "alpha_hat", se: "se_alpha", iy: "n_Iy", id: "n_Id", un: "n_union" }[k];
//       document.getElementById("sh-rig-" + k).textContent = formatStat(rig[v]);
//       document.getElementById("sh-cv-" + k).textContent  = formatStat(cvr[v]);
//     });
//     cmp.update({ rigorous: rig.alpha_hat, cv: cvr.alpha_hat, alpha_true: sim.alpha_true });
//   }
//   function formatStat(x) {
//     if (typeof x === "number") return Number.isFinite(x) ? x.toFixed(3) : "—";
//     return x;
//   }
//
//   const onParam = debounce(refit, 120);
//   ["sh-n","sh-p","sh-s","sh-a"].forEach(id => {
//     document.getElementById(id).addEventListener("input", e => {
//       const v = +e.target.value;
//       const map = { "sh-n": ["n", v, 0], "sh-p": ["p", v, 0],
//                     "sh-s": ["signal", v, 2], "sh-a": ["asymmetry", v, 2] };
//       const [key, val, prec] = map[id];
//       state[key] = val;
//       document.getElementById(id + "-val").textContent = prec ? val.toFixed(prec) : val;
//       onParam();
//     });
//   });
//
//   document.getElementById("sh-run").addEventListener("click", function () {
//     const N = 100;
//     const ar = [], ac = [];
//     let i = 0;
//     const tick = () => {
//       const end = Math.min(N, i + 2);
//       for (; i < end; i++) {
//         const sim = DGP.simulate_dl({ ...state, seed: state.seed + i + 1 });
//         const r = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "rigorous");
//         const c = LASSO.double_lasso(sim.X, sim.d, sim.y, sim.n, sim.p, "cv",
//                                      { nLam: 40, seed: state.seed + i + 1 });
//         if (Number.isFinite(r.alpha_hat)) ar.push(r.alpha_hat);
//         if (Number.isFinite(c.alpha_hat)) ac.push(c.alpha_hat);
//       }
//       document.querySelector("#sh-progress > div").style.width = (i / N * 100) + "%";
//       if (i < N) setTimeout(tick, 0);
//       else {
//         document.getElementById("sh-hist").style.display = "block";
//         hist.update({ alphas_rig: ar, alphas_cv: ac, alpha_true: state.sim.alpha_true });
//       }
//     };
//     tick();
//   });
//   refit();
// })();
