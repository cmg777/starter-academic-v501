/* Deck-local restyle of the four upstream Plotly figures (figures-src/fig-r2-master*.html,
 * fig-combined-range.html, fig-views-lisa-sdg1.html). Those includes are byte-identical copies of
 * the study repo's generated files and stay untouched; this script wraps Plotly.newPlot and adjusts
 * each figure's layout just before it is drawn. DATA ARE NEVER CHANGED: only size, fonts, labels,
 * legends and a highlight band on the Poverty (SDG 1) row.
 *
 * Loaded from plotly.html, after plotly.min.js and before the includes call Plotly.newPlot.
 * Sizes here must match the figure boxes in jasid.css (.figure-split).
 */
(function () {
  if (!window.Plotly) return;
  var INK = '#EEF3F9', MUTED = '#A9BDD4', AMBER = '#F5B455';
  var POVERTY = 'Poverty (SDG 1)';
  var TICK = 20;

  function axisFonts(ax) {
    if (!ax) return;
    ax.tickfont = Object.assign({}, ax.tickfont, { size: TICK });
    if (ax.title && ax.title.font) ax.title.font.size = 21;
  }

  // Bold the Poverty tick label and lay a soft amber band under its row.
  function highlightPoverty(layout) {
    var y = layout.yaxis, cats = y.categoryarray || y.tickvals;
    var k = cats.indexOf(POVERTY);
    if (k < 0) return;
    y.tickvals = cats.slice();
    y.ticktext = cats.map(function (c) {
      return c === POVERTY ? '<b>Poverty (SDG 1)</b>' : c;
    });
    layout.shapes = (layout.shapes || []).concat([{
      type: 'rect', xref: 'paper', yref: 'y', x0: -0.36, x1: 1, y0: k - 0.5, y1: k + 0.5,
      fillcolor: 'rgba(245,180,85,0.2)', line: { width: 0 }, layer: 'below'
    }]);
  }

  function dumbbell(data, layout) {
    layout.width = 780; layout.height = 556;
    layout.margin = { l: 230, r: 16, t: 8, b: 64 };
    layout.showlegend = false;
    layout.font.size = TICK;
    axisFonts(layout.xaxis); axisFonts(layout.yaxis);
    layout.xaxis.title.text = 'Out-of-sample R² (higher is better)';
    highlightPoverty(layout);
    data.forEach(function (t) {
      if (t.name === 'Daytime embeddings') {
        t.name = 'AI embeddings';
        t.hovertemplate = 'AI embeddings: %{x:.3f}<br>Lead of embeddings: %{customdata:+.3f}<extra></extra>';
      }
    });
  }

  var O = {
    'fig-r2-master-simple': dumbbell,
    'fig-r2-master': dumbbell,
    'fig-combined-range': function (data, layout) {
      layout.width = 780; layout.height = 556;
      layout.margin = { l: 230, r: 16, t: 34, b: 64 };
      layout.showlegend = false;
      layout.font.size = TICK;
      axisFonts(layout.xaxis); axisFonts(layout.yaxis);
      layout.xaxis.title.text = 'Out-of-sample R², lights and embeddings combined';
      (layout.annotations || []).forEach(function (a) {
        if (/^0\.60/.test(a.text)) { a.text = '0.60'; a.font.size = 19; }
      });
      highlightPoverty(layout);
      data.forEach(function (t) {
        if (/^Lower bound/.test(t.name || '')) {
          t.name = 'Tested in a new region';
          t.hovertemplate = '%{customdata}<br>New region: %{x:.3f}<extra></extra>';
        }
        if (/^Upper bound/.test(t.name || '')) {
          t.name = 'Tested in a familiar region';
          t.hovertemplate = 'Familiar region: %{x:.3f}<br>Gap: %{customdata:.3f}<extra></extra>';
        }
      });
    },
    'fig-views-lisa-sdg1': function (data, layout) {
      layout.width = 1150; layout.height = 496;
      ['geo', 'geo2', 'geo3', 'geo4'].forEach(function (g) {
        if (layout[g] && layout[g].domain) layout[g].domain.y = [0.1, 0.84];
      });
      var heads = [
        ['(a) Measured', 'reference', true],
        ['(b) Nighttime lights', '77% match', false],
        ['(c) AI embeddings', '78% match', false],
        ['(d) Lights + embeddings', '80% match', true]
      ];
      (layout.annotations || []).forEach(function (a, i) {
        var h = heads[i]; if (!h) return;
        var c = h[2] ? AMBER : MUTED;
        a.text = '<span style="font-size:21px;font-weight:700;color:' + (h[2] ? INK : MUTED) + '">' + h[0] +
          '</span><br><span style="font-size:20px;color:' + c + '">' + h[1] + '</span>';
      });
      if (layout.legend) {
        layout.legend.font = Object.assign({}, layout.legend.font, { size: 19 });
        layout.legend.y = 0;
      }
      data.forEach(function (t) {
        if (t.name === '(c) Daytime embeddings') t.name = '(c) AI embeddings';
        if (t.name === '(a) Actual') t.name = '(a) Measured';
        if (t.name === '(d) Combined') t.name = '(d) Lights + embeddings';
      });
    }
  };

  var newPlot = window.Plotly.newPlot;
  window.Plotly.newPlot = function (gd, data, layout) {
    var id = typeof gd === 'string' ? gd : gd && gd.id;
    if (O[id] && layout && !layout._jasid) {
      layout._jasid = true;
      try { O[id](data, layout); } catch (e) { console.warn('jasid-figures', id, e); }
      delete layout._jasid;
      var el = document.getElementById(id);
      if (el) { el.style.width = layout.width + 'px'; el.style.height = layout.height + 'px'; }
    }
    return newPlot.apply(this, arguments);
  };
})();
