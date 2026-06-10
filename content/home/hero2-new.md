---
# LIVE: this is the redesigned native hero (the old Canva-GIF hero in
# `hero2.md` is now `active: false`). The new-hero SCSS is Section 21 of
# `assets/scss/custom.scss`, scoped to `#hero2-new`.
#
# Title-transparency bug — RESOLVED 2026-06-03. The long-standing "title
# letters render transparent (map visible through letterforms)" issue was
# NOT a macOS/extension problem. Root cause: the scroll-driven `heroFadeOut`
# used `animation-timeline: view()`, which bound to `#hero2-new` (it has
# `overflow: hidden` for the Ken Burns bg, making it a scroll container)
# instead of the document. The topmost (title) panel therefore resolved to a
# fixed ~0.43 opacity even at scroll top, so the whole card — navy panel and
# white text — was semi-transparent. Reproduced deterministically in headless
# Chromium by diffing the title panel's computed opacity vs the (solid) lower
# panels. Fix: removed the `heroFadeOut` view-timeline block. See
# `logs/2026-06-03-hero-title-fix.md` (and `logs/2026-05-11-hero-native-text.md`
# for the earlier diagnostic history).
#
# 2026-06-03 — modern/dynamic enhancement pass (Section 21 of custom.scss +
# the inline script below): drawing underline (B4), rotating research pillars in
# the subtitle (B2), and cursor counter-parallax on the KEPT websiteCover5.webp
# background (C1). Cards stay fully transparent. (A nightlights twinkle canvas,
# frosted-glass panels, and a word-by-word title reveal were tried and removed
# per review.) Still NO `animation-timeline: view()` — that was the root cause of
# the transparent-title bug above.
#
# Easter egg: the <h1> title is a HIDDEN link to the Canva slides
# (https://canva.link/hhrue9c5aogivjn) — styled (.hero-title-link in Section 21)
# to look exactly like plain text, pointer cursor on hover only, no tooltip.
# Intentional, not a styling bug.

widget: blank

# Activate this widget? true/false
active: true

headless: true
weight: 02
title:
hero_media:

design:
  background:
    image: websiteCover5.webp
    image_darken: 0
    image_size: cover
    image_position: center
    image_parallax: false
    text_color_light: true
---

<div class="hero-native">
  <div class="hero-glass-card hero-glass-card--title hero-glass-card--delay-1">
    <h1 class="hero-title"><a class="hero-title-link" href="https://canva.link/hhrue9c5aogivjn" target="_blank" rel="noopener">On the Geography of Development</a></h1>
    <div class="hero-title-underline" aria-hidden="true"></div>
    <p class="hero-subtitle" data-rotate="Geospatial Big Data|Development Economics|Spatial Econometrics|Causal Machine Learning" aria-label="Insights from Geospatial Big Data, Development Economics, Spatial Econometrics, and Causal Machine Learning">Insights from Geospatial Big Data, Development Economics, Spatial Econometrics, and Causal Machine Learning</p>
  </div>

  <div class="hero-glass-card hero-glass-card--tagline hero-glass-card--delay-2">
    <p class="hero-tagline">When, where and why development occurs&hellip;</p>
  </div>

  <div class="hero-glass-card hero-glass-card--author hero-glass-card--delay-3">
    <p class="hero-author-name">Carlos Mendez</p>
    <p class="hero-author-affiliation">Graduate School of International Development<br>Nagoya University, Japan</p>
  </div>

  <a href="#about" class="hero-scroll-indicator" aria-label="Scroll to about section">
    <span class="hero-scroll-label">scroll</span>
    <span class="hero-scroll-chevron" aria-hidden="true">&#9662;</span>
  </a>
</div>

<script>
  (function () {
    var hero = document.getElementById('hero2-new');
    if (!hero) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noHover = window.matchMedia('(hover: none)').matches;

    /* ---- Cursor parallax: cards (existing) + background counter-parallax (C1) ---- */
    if (!reduce && !noHover) {
      var panels = hero.querySelectorAll('.hero-glass-card');
      var mult = [6, 4, 3];
      var raf = null, lx = 0, ly = 0;
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        lx = (e.clientX - r.left) / r.width - 0.5;
        ly = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          for (var i = 0; i < panels.length; i++) {
            var m = mult[i] || 2;
            panels[i].style.setProperty('--px', (lx * m).toFixed(2) + 'px');
            panels[i].style.setProperty('--py', (ly * m).toFixed(2) + 'px');
          }
          /* background drifts OPPOSITE the cursor for depth (image is kept) */
          hero.style.setProperty('--bg-px', (lx * -12).toFixed(2) + 'px');
          hero.style.setProperty('--bg-py', (ly * -12).toFixed(2) + 'px');
        });
      });
      hero.addEventListener('mouseleave', function () {
        for (var j = 0; j < panels.length; j++) {
          panels[j].style.setProperty('--px', '0px');
          panels[j].style.setProperty('--py', '0px');
        }
        hero.style.setProperty('--bg-px', '0px');
        hero.style.setProperty('--bg-py', '0px');
      });
    }

    /* ---- B2: typewriter research pillars (Indonesia514-style; motion only,
       full comma list kept for reduced-motion / screen readers) ---- */
    if (!reduce) {
      var sub = hero.querySelector('.hero-subtitle[data-rotate]');
      if (sub) {
        var items = sub.getAttribute('data-rotate').split('|');
        if (items.length > 1) {
          sub.textContent = '';
          var lead = document.createElement('span');
          lead.className = 'hero-subtitle-lead';
          lead.textContent = 'Insights from';
          var rot = document.createElement('span');
          rot.className = 'hero-rotator';
          rot.setAttribute('aria-hidden', 'true');
          /* invisible sizer = longest phrase, so the centered line never reflows
             as the live text types and deletes */
          var longest = items[0];
          for (var q = 1; q < items.length; q++) {
            if (items[q].length > longest.length) longest = items[q];
          }
          var sizer = document.createElement('span');
          sizer.className = 'hero-rotator-sizer';
          sizer.textContent = longest;
          var live = document.createElement('span');
          live.className = 'hero-rotator-live';
          var txt = document.createElement('span');
          txt.className = 'hero-rotator-text';
          var cur = document.createElement('span');
          cur.className = 'hero-rotator-cursor';
          cur.textContent = '|';
          live.appendChild(txt);
          live.appendChild(cur);
          rot.appendChild(sizer);
          rot.appendChild(live);
          sub.appendChild(lead);
          sub.appendChild(rot);

          var ti = 0, ci = 0, deleting = false;
          var TYPE = 90, DEL = 45, HOLD = 1800, GAP = 500;
          function tick() {
            var word = items[ti];
            if (!deleting) {
              ci++;
              txt.textContent = word.slice(0, ci);
              if (ci >= word.length) { deleting = true; return setTimeout(tick, HOLD); }
              return setTimeout(tick, TYPE);
            }
            ci--;
            txt.textContent = word.slice(0, ci);
            if (ci <= 0) {
              deleting = false;
              ti = (ti + 1) % items.length;
              return setTimeout(tick, GAP);
            }
            return setTimeout(tick, DEL);
          }
          setTimeout(tick, 600);
        }
      }
    }
  })();
</script>
