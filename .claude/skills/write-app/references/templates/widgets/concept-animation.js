// widget: concept-animation — READY (default Tab 1 on every app)
//
// HTML PANE (insert into index.html.tmpl's {{TAB_PANES}} as tab 1):
// ----------------------------------------------------------------
// <section id="pane-intro" class="tab-pane active" role="tabpanel" aria-labelledby="tab-intro">
//   <h2>{{INTRO_HEADING}}</h2>
//   <p class="lede">{{LEDE}}</p>
//   <div class="card">
//     <h3>{{ANIM_HEADING}}</h3>
//     <p>{{ANIM_DESC}}</p>
//     <div class="chart-area" id="intro-anim"></div>
//   </div>
//   <div class="cta-cards">{{CTA_CARDS}}</div>
//   <div class="card">
//     <h3>Glossary</h3>
//     <div class="grid grid-2">{{GLOSSARY}}</div>
//   </div>
// </section>
//
// JS INIT (insert into app.js.tmpl's {{WIDGET_INIT}}):
// ---------------------------------------------------
// CHARTS.l1_vs_l2_animation(document.getElementById("intro-anim"));
//
// Topic-family variants (when the L1-vs-L2 narrative does not fit the post):
//   - parallel_trends_animation   — for DiD / panel posts
//   - mean_reversion_animation    — for convergence / time-series posts
//   - confounder_path_animation   — for IV / causal-diagram posts
// These are sketched in this file but not yet validated; the skill
// falls back to l1_vs_l2_animation if no topic-family override is set.
