/* tutorial-gallery.js
 * Behaviors for the /post/ tutorial gallery:
 *   - live search (title + summary)
 *   - language filter chips
 *   - sort within each strip (newest / oldest / A-Z)
 *   - sticky topic jump-nav + scroll-spy active link
 *   - mouse drag-to-scroll on horizontal strips
 *   - hide empty topic rows when filters match nothing
 */
(function () {
  'use strict';
  if (window.__tutorialGalleryInit) return;
  window.__tutorialGalleryInit = true;

  document.addEventListener('DOMContentLoaded', function () {
    var searchEl = document.getElementById('tg-search');
    var chipsEl = document.querySelector('.tg-chips');
    var sortEl = document.getElementById('tg-sort');
    var resetBtn = document.getElementById('tg-reset');
    var emptyState = document.getElementById('tg-empty-state');
    var rows = Array.prototype.slice.call(document.querySelectorAll('.tg-topic-row'));
    var topicLinks = Array.prototype.slice.call(document.querySelectorAll('.tg-topic-nav a'));
    if (!rows.length) return;

    var state = { query: '', language: '*', sort: 'newest' };

    /* ---------- filtering ---------- */
    function applyFilters() {
      var q = state.query.trim();
      var anyVisible = false;
      rows.forEach(function (row) {
        var cards = row.querySelectorAll('.tg-card');
        var visibleInRow = 0;
        cards.forEach(function (card) {
          var matchesLang = state.language === '*' || card.dataset.language === state.language;
          var matchesQuery = true;
          if (q) {
            var hay = (card.dataset.title || '') + ' ' + (card.dataset.summary || '');
            matchesQuery = hay.indexOf(q) !== -1;
          }
          var show = matchesLang && matchesQuery;
          if (show) {
            card.removeAttribute('hidden');
            visibleInRow++;
          } else {
            card.setAttribute('hidden', '');
          }
        });
        if (visibleInRow === 0) {
          row.setAttribute('hidden', '');
        } else {
          row.removeAttribute('hidden');
          anyVisible = true;
        }
      });
      if (emptyState) {
        if (anyVisible) emptyState.setAttribute('hidden', '');
        else emptyState.removeAttribute('hidden');
      }
    }

    /* ---------- sorting ---------- */
    function applySort() {
      rows.forEach(function (row) {
        var strip = row.querySelector('.tg-topic-strip');
        if (!strip) return;
        var cards = Array.prototype.slice.call(strip.querySelectorAll('.tg-card'));
        cards.sort(function (a, b) {
          if (state.sort === 'az') {
            return (a.dataset.title || '').localeCompare(b.dataset.title || '');
          }
          var da = a.dataset.date || '';
          var db = b.dataset.date || '';
          if (state.sort === 'oldest') return da.localeCompare(db);
          return db.localeCompare(da); // newest
        });
        cards.forEach(function (c) { strip.appendChild(c); });
      });
    }

    /* ---------- event wiring ---------- */
    var debounceTimer = null;
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          state.query = searchEl.value.toLowerCase();
          applyFilters();
        }, 150);
      });
    }

    if (chipsEl) {
      chipsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.tg-chip');
        if (!btn) return;
        var v = btn.dataset.language;
        if (!v) return;
        state.language = v;
        chipsEl.querySelectorAll('.tg-chip').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        applyFilters();
      });
    }

    if (sortEl) {
      sortEl.addEventListener('change', function () {
        state.sort = sortEl.value;
        applySort();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.query = '';
        state.language = '*';
        if (searchEl) searchEl.value = '';
        if (chipsEl) {
          chipsEl.querySelectorAll('.tg-chip').forEach(function (b) {
            b.classList.toggle('active', b.dataset.language === '*');
          });
        }
        applyFilters();
      });
    }

    /* ---------- topic jump-nav scroll-spy ---------- */
    if (topicLinks.length && 'IntersectionObserver' in window) {
      var linkMap = {};
      topicLinks.forEach(function (a) {
        linkMap[a.dataset.topicLink] = a;
      });
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.dataset.topicId;
          var link = linkMap[id];
          if (!link) return;
          if (entry.isIntersecting) {
            topicLinks.forEach(function (a) { a.classList.remove('active'); });
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-180px 0px -55% 0px', threshold: 0 });
      rows.forEach(function (row) { observer.observe(row); });
    }

    /* ---------- drag-to-scroll on each strip ---------- */
    document.querySelectorAll('.tg-topic-strip, .tg-teaser-strip').forEach(function (strip) {
      var isDown = false, startX = 0, scrollStart = 0, moved = 0;
      strip.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') return;
        isDown = true;
        moved = 0;
        startX = e.clientX;
        scrollStart = strip.scrollLeft;
        strip.classList.add('dragging');
      });
      strip.addEventListener('pointermove', function (e) {
        if (!isDown) return;
        var dx = e.clientX - startX;
        moved = Math.abs(dx);
        strip.scrollLeft = scrollStart - dx;
      });
      function release() {
        if (!isDown) return;
        isDown = false;
        strip.classList.remove('dragging');
      }
      strip.addEventListener('pointerup', release);
      strip.addEventListener('pointerleave', release);
      strip.addEventListener('pointercancel', release);
      // Prevent click navigation when the user actually dragged
      strip.addEventListener('click', function (e) {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });
  });
})();
